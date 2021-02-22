import { JSBI } from '@uniswap/sdk';
import BN from 'bignumber.js';
export { JSBI, BN };

export function isValue(v: any): boolean {
  return (
    v !== null &&
    v !== false &&
    v !== undefined &&
    v !== '' &&
    !isNaN(v)
  )
}
export function isNotZero(v: any): boolean {
  return (
    isValue(v) &&
    v !== 0 &&
    v !== '0'
  )
}

export function amountToInt(amount: string, decimals: number): string {
  return new BN(amount).times(10 ** decimals).dp(0).toFixed();
}

export function amountToDecimal(amount: string, decimals: number): string {
  return new BN(amount).div(10 ** decimals).toFixed();
}

export function significantNumbers(n: string | BN, sd = SIGNIFICANT_DIGITS) {
  return new BN(n).sd(sd).toFixed();
}
export function truncateNumber(value: string, decimals: number) {
  return new BN(value).dp(decimals, BN.ROUND_FLOOR).toFixed();
}

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const SIGNIFICANT_DIGITS = 7;
