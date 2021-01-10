import React, { useState } from 'react';
import { Box} from '@material-ui/core';
import { Button, IconDown, useTheme, GU } from '@aragon/ui'

import { TokenSelectorModal } from './TokenSelectorModal';
import { CurrencyLogo } from './CurrencyLogo';
import styled from 'styled-components';

const CurrencyButton = styled(Button)`
  justify-content: start;
  padding-right: ${1.5 * GU}px;
  border-radius: 20px;
  border-color: #aecfd6;
  box-shadow: none;
`

type Props = {
  selectedSymbol: string;
  onChange: (CurrencySymbol) => void;
  disabled?: boolean;
};

export const TokenSelector: React.FC<Props> = ({ selectedSymbol, onChange, disabled }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(true);
  const theme = useTheme();

  function onSelectToken(symbol) {
    onChange(symbol);
    setModalOpen(false);
  }
  
  return (
    <>
      <TokenSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectToken={onSelectToken}
      />
      <CurrencyButton
        onClick={() => setModalOpen(true)}
        disabled={disabled}
        icon={<CurrencyLogo symbol={selectedSymbol}/>}
        label={selectedSymbol}
        wide
      >
        <Box display="flex" alignItems="center" justifyContent="center" width={1}>
          <Box width={20} display="flex" alignItems="center" justifyContent="center">
            <CurrencyLogo symbol={selectedSymbol}/>
          </Box>
          <Box flex={1} ml={1} textAlign="start">
            {selectedSymbol}
          </Box>
          <Box color={disabled ? theme.disabledIcon.toString() : theme.accent.toString()} ml={1.5} display="flex" alignItems="center">
            <IconDown
              size="tiny"
            />
          </Box>
        </Box>
      </CurrencyButton>
    </>
  );
}
