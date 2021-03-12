import React, { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { Button } from '../UI/StyledComponents'
import { LoadingRing, IconWallet } from '@aragon/ui'
import { Flex, Box, Image } from '@chakra-ui/react'
import makeBlockie from 'ethereum-blockies-base64'

import { getAddress, getShortAddress, getWalletStatus, isWalletLoading } from '../../redux/wallet/selectors'
import { WalletStatus } from '../../redux/wallet/state'
import { selectENS } from '../../redux/user/userSlice'
import { login } from '../../redux/wallet/actions'

function AccountBadge() {
  const history = useHistory()
  const dispatch = useDispatch()

  const walletStatus = useSelector(getWalletStatus)
  const walletLoading = useSelector(isWalletLoading)
  const address = useSelector(getAddress)
  const shortenAddress = useSelector(getShortAddress)
  const ens = useSelector(selectENS)

  const imgBlockie = useMemo(() => address && makeBlockie(address), [address])

  function goToProfile() {
    history.push('/account')
  }

  if (walletLoading)
    return (
      <Button variant="solid" bg="#b8b9bb" color="color" leftIcon={<LoadingRing />} disabled>
        Connecting...
      </Button>
    )

  function connectWallet() {
    dispatch(login())
  }

  let button
  if (walletStatus === WalletStatus.DISCONNECTED) {
    button = (
      <Button variant="outline" leftIcon={<IconWallet />} onClick={connectWallet}>
        Not connected
      </Button>
    )
  } else {
    const displayedName = ens || shortenAddress

    button = (
      <Button variant="outline" onClick={goToProfile}>
        <Image src={imgBlockie} borderRadius="full" boxSize="20px" />
        <Box ml={2} mr={2}>
          {displayedName}
        </Box>
      </Button>
    )
  }

  return <Flex>{button}</Flex>
}

export default AccountBadge
