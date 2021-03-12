import React, { useState } from 'react'
import { Box } from '@material-ui/core'
import { Button, IconDown, useTheme, GU } from '@aragon/ui'

import { TokenSelectorModal } from './TokenSelectorModal'
import { CurrencyLogo } from './CurrencyLogo'
import styled from 'styled-components'

const CurrencyButton = styled(Button)`
  justify-content: start;
  padding-right: ${1.5 * GU}px;
  border: none;
  outline: none;
  box-shadow: none;
`

type Props = {
  selectedSymbol: string
  onChange: (CurrencySymbol) => void
  disabled?: boolean
}

export const TokenSelector: React.FC<Props> = ({ selectedSymbol, onChange, disabled }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const theme = useTheme()

  function onSelectToken(symbol) {
    onChange(symbol)
    setModalOpen(false)
  }

  return (
    <>
      <TokenSelectorModal open={modalOpen} onClose={() => setModalOpen(false)} onSelectToken={onSelectToken} />
      <CurrencyButton
        onClick={() => setModalOpen(true)}
        disabled={disabled}
        icon={<CurrencyLogo symbol={selectedSymbol} />}
        label={selectedSymbol}
        wide
      >
        <Box display="flex" alignItems="center" justifyContent="center" width={1}>
          <Box width={25} display="flex" alignItems="center" justifyContent="center">
            <CurrencyLogo symbol={selectedSymbol} />
          </Box>
          <Box flex={1} ml={1} textAlign="start" fontSize="1.2rem">
            {selectedSymbol}
          </Box>
          <Box
            color={disabled ? theme.disabledIcon.toString() : theme.accent.toString()}
            ml={1}
            display="flex"
            alignItems="center"
          >
            <IconDown size="tiny" />
          </Box>
        </Box>
      </CurrencyButton>
    </>
  )
}
