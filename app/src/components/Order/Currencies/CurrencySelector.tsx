import React from 'react';

import { CurrencyType } from '../../../lib/trading/currencyTypes';
import { FiatSelector } from './FiatSelector';
import { TokenSelector } from './TokenSelector';


type Props = {
  selectedSymbol: string;
  onChange: (CurrencySymbol) => void;
  disabled?: boolean;
  currencyType: CurrencyType;
};

export const CurrencySelector: React.FC<Props> = ({ selectedSymbol, onChange, disabled, currencyType }) => {
  return (
    <>
      {currencyType === CurrencyType.FIAT &&
      <FiatSelector
        selectedSymbol={selectedSymbol}
        onChange={onChange}
        disabled={disabled}
      />
      }
      {currencyType === CurrencyType.CRYPTO &&
      <TokenSelector
        selectedSymbol={selectedSymbol}
        onChange={onChange}
        disabled={disabled}
      />
      }
    </>
  );
}
