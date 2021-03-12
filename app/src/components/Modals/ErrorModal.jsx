import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Box, Dialog } from '@material-ui/core'
import { Button, IconCaution, useTheme } from '@aragon/ui'

import { getModalError } from '../../redux/ui/selectors'
import { setModalError } from '../../redux/ui/actions'

const networkName = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  42: 'Kovan',
}

function getNetworkName(chainId) {
  return networkName[chainId] || chainId
}

function getErrorTitle(error) {
  switch (error?.message) {
    case 'eth_smart_account_not_supported':
    case 'eth_wrong_network_id':
    case 'no_ethereum_provider':
    case 'unable_open_wallet':
      return 'Unable to connect wallet.'
    case 'invalid-custom-token':
      return 'Invalid token'
    case 'eth_signature_rejected':
      return 'Requires authentication'
    case 'error-fetching-balances':
      return 'Balances unavailable'
    case 'error-debug':
      return 'Debug'
    default:
      return 'Unknown error'
  }
}

function getErrorContent(error) {
  switch (error?.message) {
    case 'eth_smart_account_not_supported':
      return 'We currently do not support smart account wallets such as Argent or Gnosis Safe.'
    case 'eth_wrong_network_id':
      return `Your wallet is on a wrong network (${getNetworkName(
        error.meta.walletChainId
      )}). Please switch to ${getNetworkName(error.meta.expectedChainId)}.`
    case 'no_ethereum_provider':
      return 'It seems you are not using an ethereum compatible browser. Please install Metamask or use a browser such as Brave.'
    case 'unable_open_wallet':
      return `We encountered an error while trying to connect with your wallet. Please try again or report this problem to our support.`
    case 'eth_signature_rejected':
      return 'We were unable to prove your identity. Please retry to connect and check signature requests in your wallet.'
    case 'invalid-custom-token':
      return 'The token address you provided is either invalid or does not exist on Uniswap.'
    case 'error-fetching-balances':
      return "We could'nt get token balances of your wallet"
    case 'error-debug':
      return JSON.stringify(error.meta, null, 2)
    default:
      return 'We did not expect that error, and will try to fix it soon. Do not hesitate to contact the support to help get this fixed.'
  }
}

export default function ErrorModal() {
  const modalError = useSelector(getModalError)
  const dispatch = useDispatch()
  const theme = useTheme()

  function onCloseModal() {
    dispatch(setModalError(null))
  }

  return (
    <Dialog open={!!modalError} onClose={onCloseModal} maxWidth="sm">
      <Box p={1}>
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" width={1} p={2}>
          <Box fontSize={14} width={1} textAlign="center" mb={1}>
            {getErrorTitle(modalError)}
          </Box>
          <Box fontSize={12}>
            <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
              <IconCaution size="large" style={{ color: theme.negative }} />
            </Box>

            <Box textAlign="center" width={1}>
              {getErrorContent(modalError)}
            </Box>
          </Box>
          <Box mb={1} />
          <Button onClick={onCloseModal}>Close</Button>
        </Box>
      </Box>
    </Dialog>
  )
}
