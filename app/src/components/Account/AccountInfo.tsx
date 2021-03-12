import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { Button } from '@aragon/ui'
import { Box, Typography } from '@material-ui/core'
import { ExitToApp } from '@material-ui/icons'

import { useMediaQuery } from '@chakra-ui/react'

import { ShadowBox, SimpleLink } from '../UI/StyledComponents'

import { getAddress, getShortAddress } from '../../redux/wallet/selectors'
import { logout } from '../../redux/wallet/actions'
import { selectENS } from '../../redux/user/userSlice'
import { getEtherscanAddressURL } from '../../lib/eth'

// @ts-ignore
const BadgeBox = styled(ShadowBox)`
  padding: 12px;
  margin-bottom: 12px;
`

// @ts-ignore
const AddressText = styled(Typography)`
  && {
    color: #504e4e;
  }
`

export default function AccountInfo() {
  const dispatch = useDispatch()
  const [isSmall] = useMediaQuery('(max-width: 960px)')

  const address = useSelector(getAddress)
  const shortenAddress = useSelector(getShortAddress)
  const ens = useSelector(selectENS)

  function onLogout() {
    dispatch(logout())
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="subtitle1" align="center">
        Logged in as:
      </Typography>
      <BadgeBox>
        <SimpleLink href={getEtherscanAddressURL(address)} external>
          <AddressText variant="caption" align="center">
            {isSmall ? shortenAddress : address} {ens && <i>({ens})</i>}
          </AddressText>
        </SimpleLink>
      </BadgeBox>
      <Button icon={<ExitToApp />} mode="negative" size="small" label="Disconnect" onClick={onLogout} />
    </Box>
  )
}
