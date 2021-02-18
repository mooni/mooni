import { CurrencySymbol } from '../lib/trading/currencyTypes';

type OutputLimits = Record<CurrencySymbol, number>;

const dailyLimits: OutputLimits = {
  EUR: 920,
  CHF: 1000,
};

const yearlyLimits: OutputLimits = {
  EUR: 92000,
  CHF: 100000,
};

export { dailyLimits, yearlyLimits };
