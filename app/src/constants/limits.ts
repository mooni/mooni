import { CurrencySymbol } from '../lib/trading/types';

type OutputLimits = Record<CurrencySymbol, number>;

const outputLimits: OutputLimits = {
  EUR: 920,
  CHF: 1000,
};

export { outputLimits };
