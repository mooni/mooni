import React from 'react';

import {Box} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {useSelector} from 'react-redux';

import {Button, IconRefresh, LoadingRing, textStyle} from '@aragon/ui'
import styled from 'styled-components';

import config from '../config';
import AmountRow from './AmountRow';

import {TradeExact, TradeRequest} from '../lib/trading/types';

import {getInputCurrencies} from '../redux/ui/selectors';

import {getCurrenciesSymbols} from '../lib/trading/currencyHelpers';
import {useRate} from '../hooks/rates';
import {getETHManager, getETHManagerLoading} from '../redux/eth/selectors';
import {CurrencyType} from "../lib/trading/currencyTypes";
import { RateAmount } from "./RateAmount";

const InvalidMessage = styled.p`
  ${textStyle('body4')};
  color: #e61b1b;
`;

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(3),
  },
  additionalInfo: {
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
  },
}));

const outputCurrencies: string[] = getCurrenciesSymbols(CurrencyType.FIAT);

interface RateFormParams {
 onSubmit: (TradeRequest?) => void;
  initialTradeRequest: TradeRequest;
  buttonLabel?: string,
  buttonIcon?: any,
}

function RateForm({ onSubmit = () => null, initialTradeRequest, buttonLabel = 'Exchange', buttonIcon = <IconRefresh /> }: RateFormParams) {
  const classes = useStyles();
  const inputCurrencies = useSelector(getInputCurrencies);
  const ethManager = useSelector(getETHManager);
  const ethManagerLoading = useSelector(getETHManagerLoading);

  const { rateForm, tradeRequest, multiTradeEstimation, onChangeAmount, onChangeCurrency } = useRate(initialTradeRequest);

  const valid = !(rateForm.loading || rateForm.errors);
  const errors = rateForm.errors;

  function submit() {
    if(!valid) return;
    onSubmit(tradeRequest);
  }

  return (
    <>
      <AmountRow
        value={rateForm.values.inputAmount}
        currencies={inputCurrencies}
        selectedSymbol={rateForm.values.inputCurrency}
        onChangeCurrency={onChangeCurrency(TradeExact.INPUT)}
        onChangeValue={onChangeAmount(TradeExact.INPUT)}
        active={rateForm.values.tradeExact === TradeExact.INPUT}
        currencyDisabled={rateForm.values.tradeExact === TradeExact.OUTPUT && rateForm.loading}
        valueDisabled={rateForm.values.tradeExact === TradeExact.OUTPUT && rateForm.loading}
        error={!rateForm.loading && rateForm.values.tradeExact === TradeExact.INPUT && !!errors}
        caption="Send"
      />
      <AmountRow
        value={rateForm.values.outputAmount}
        currencies={outputCurrencies}
        selectedSymbol={rateForm.values.outputCurrency}
        onChangeCurrency={onChangeCurrency(TradeExact.OUTPUT)}
        onChangeValue={onChangeAmount(TradeExact.OUTPUT)}
        active={rateForm.values.tradeExact === TradeExact.OUTPUT}
        currencyDisabled={rateForm.values.tradeExact === TradeExact.INPUT && rateForm.loading}
        valueDisabled={rateForm.values.tradeExact === TradeExact.INPUT && rateForm.loading}
        error={!rateForm.loading && rateForm.values.tradeExact === TradeExact.OUTPUT && !!errors}
        caption="Receive"
      />

      <Box className={classes.additionalInfo}>
        {!rateForm.loading ?
          !errors ?
            (multiTradeEstimation && <RateAmount multiTradeEstimation={multiTradeEstimation}/>)
            :
            Object.entries(errors).map(([key, value]) =>
              <InvalidMessage key={key}>
                {key === 'lowBalance' && 'You do not have enough funds'}
                {key === 'lowAmount' && `Minimum amount is ${errors[key]} ${rateForm.values.outputCurrency}`}
                {key === 'highAmount' && `Maximum amount is ${config.maxOutputAmount} ${rateForm.values.outputCurrency}`}
                {key === 'zeroAmount' && `Amount can't be zero`}
              </InvalidMessage>
            )
          :
          <LoadingRing/>
        }
      </Box>
      {(ethManager && !ethManagerLoading) &&
      <Button mode="strong" onClick={submit} wide icon={buttonIcon} label={buttonLabel} disabled={!valid} />
      }
    </>
  );
}

export default RateForm;
