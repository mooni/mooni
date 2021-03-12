import React, { useCallback } from 'react'

import { Box, Flex } from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'

import { IconCaution, IconCoin, IconRefresh, LoadingRing, IconEthereum, textStyle } from '@aragon/ui'
import { QuestionOutlineIcon, ChevronDownIcon } from '@chakra-ui/icons'
import styled from 'styled-components'

import { AmountRow } from './AmountRow'

import { TradeExact, TradeRequest } from '../../lib/trading/types'

import { useRate } from '../../hooks/rates'
import { getWalletStatus } from '../../redux/wallet/selectors'
import { CurrencyType } from '../../lib/trading/currencyTypes'
import { RateAmount } from './RateAmount'
import { WalletStatus } from '../../redux/wallet/state'
import { ApprovalState, useApprovalForMultiTradeEstimation } from '../../hooks/allowance'
import { logError } from '../../lib/log'
import { RoundButton } from '../UI/StyledComponents'
import { login } from '../../redux/wallet/actions'
import { dailyLimits } from '../../constants/limits'
import { numberWithCommas } from '../../lib/numbers'
import { useTradeBalance } from '../../hooks/balance'
import { ETHER } from '../../lib/trading/currencyList'

const InvalidMessage = styled.p`
  ${textStyle('body4')};
  color: ${(props) => props.theme.negative};
`

const Separator = styled.div`
  display: flex;
  justify-content: center;
  margin: 2px 0;
  color: #99e1ea;
`

interface RateFormParams {
  onSubmit: (TradeRequest?) => void
  initialTradeRequest: TradeRequest
  buttonLabel?: string
  buttonIcon?: any
}

function RateForm({ onSubmit = () => null, initialTradeRequest }: RateFormParams) {
  const dispatch = useDispatch()
  const walletStatus = useSelector(getWalletStatus)

  const { rateForm, tradeRequest, multiTradeEstimation, onChangeAmount, onChangeCurrency } = useRate(
    initialTradeRequest
  )
  const { approvalState, approveAllowance } = useApprovalForMultiTradeEstimation(multiTradeEstimation)
  const { balanceLoading, insufficientBalance, maxAmount } = useTradeBalance(tradeRequest, multiTradeEstimation)

  const errors = rateForm.errors

  const submit = useCallback(() => {
    if (!tradeRequest) return
    onSubmit(tradeRequest)
  }, [tradeRequest, onSubmit])

  const approve = useCallback(() => {
    approveAllowance().catch((error) => {
      if (error.message === 'user-rejected-transaction') return
      else {
        logError('approve-error', error)
      }
    })
  }, [approveAllowance])

  let button
  if (walletStatus === WalletStatus.CONNECTED) {
    if (errors && errors.zeroAmount) {
      button = <RoundButton wide icon={<QuestionOutlineIcon />} label="Enter amount" disabled />
    } else if (approvalState === ApprovalState.MINING) {
      button = <RoundButton wide icon={<LoadingRing />} label="Unlocking tokens" disabled />
    } else if (balanceLoading) {
      button = <RoundButton wide icon={<LoadingRing />} label="Loading balances" disabled />
    } else if (insufficientBalance) {
      button = <RoundButton wide icon={<IconCaution />} label="Insufficient balance" disabled />
    } else if (rateForm.loading) {
      button = <RoundButton wide icon={<LoadingRing />} label="Loading rates" disabled />
    } else if (errors) {
      button = <RoundButton wide icon={<IconCaution />} label="Invalid" disabled />
    } else if (approvalState === ApprovalState.LOADING) {
      button = <RoundButton wide icon={<LoadingRing />} label="Checking allowance" disabled />
    } else if (approvalState === ApprovalState.UNKNOWN) {
      button = <RoundButton wide icon={<IconRefresh />} label="Exchange" disabled />
    } else if (approvalState === ApprovalState.NOT_APPROVED) {
      button = <RoundButton mode="positive" onClick={approve} wide icon={<IconCoin />} label="Unlock token" />
    } else {
      button = <RoundButton mode="strong" onClick={submit} wide icon={<IconRefresh />} label="Exchange" />
    }
  } else if (walletStatus === WalletStatus.DISCONNECTED) {
    if (errors && errors.zeroAmount) {
      button = <RoundButton wide icon={<QuestionOutlineIcon />} label="Enter amount" disabled />
    } else if (rateForm.loading) {
      button = <RoundButton wide icon={<LoadingRing />} label="Loading rates" disabled />
    } else {
      button = (
        <RoundButton
          mode="positive"
          onClick={() => dispatch(login())}
          wide
          icon={<IconEthereum />}
          label="Connect wallet"
        />
      )
    }
  } else {
    button = <RoundButton disabled wide icon={<LoadingRing />} display="all" label="Connecting..." />
  }

  const onMax =
    rateForm.values.inputCurrency !== ETHER.symbol && maxAmount !== '0'
      ? () => onChangeAmount(TradeExact.INPUT)(maxAmount)
      : undefined

  return (
    <>
      <AmountRow
        value={rateForm.values.inputAmount}
        currencyType={CurrencyType.CRYPTO}
        selectedSymbol={rateForm.values.inputCurrency}
        onChangeCurrency={onChangeCurrency(TradeExact.INPUT)}
        onChangeValue={onChangeAmount(TradeExact.INPUT)}
        active={rateForm.values.tradeExact === TradeExact.INPUT}
        // currencyDisabled={rateForm.values.tradeExact === TradeExact.OUTPUT && rateForm.loading}
        // valueDisabled={rateForm.values.tradeExact === TradeExact.OUTPUT && rateForm.loading}
        error={!rateForm.loading && rateForm.values.tradeExact === TradeExact.INPUT && !!errors}
        caption="From"
        onMax={onMax}
        balanceAvailable={onMax && maxAmount}
      />
      <Separator>
        <ChevronDownIcon />
      </Separator>
      <AmountRow
        value={rateForm.values.outputAmount}
        currencyType={CurrencyType.FIAT}
        selectedSymbol={rateForm.values.outputCurrency}
        onChangeCurrency={onChangeCurrency(TradeExact.OUTPUT)}
        onChangeValue={onChangeAmount(TradeExact.OUTPUT)}
        active={rateForm.values.tradeExact === TradeExact.OUTPUT}
        // currencyDisabled={rateForm.values.tradeExact === TradeExact.INPUT && rateForm.loading}
        // valueDisabled={rateForm.values.tradeExact === TradeExact.INPUT && rateForm.loading}
        error={!rateForm.loading && rateForm.values.tradeExact === TradeExact.OUTPUT && !!errors}
        caption="To"
      />

      <Box mt={4}>{button}</Box>

      {errors && (
        <Flex justify="center" mt={errors.zeroAmount ? 0 : 4}>
          {Object.entries(errors).map(([key, _]) => (
            <InvalidMessage key={key}>
              {key === 'lowAmount' && `Minimum amount is ${errors[key]} ${rateForm.values.outputCurrency}`}
              {key === 'highAmount' &&
                `Maximum amount is ${numberWithCommas(dailyLimits[rateForm.values.outputCurrency])} ${
                  rateForm.values.outputCurrency
                }`}
              {key === 'lowLiquidity' &&
                `There is not enough liquidity for this pair to trade. Please try with another currency.`}
              {key === 'failed' && `Impossible to fetch rates. Please try with different amounts.`}
            </InvalidMessage>
          ))}
        </Flex>
      )}

      {multiTradeEstimation && (
        <Box mt={4}>
          <RateAmount multiTradeEstimation={multiTradeEstimation} />
        </Box>
      )}
    </>
  )
}

export default RateForm
