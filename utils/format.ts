import { USDT_DECIMALS } from '@/lib/constants';

export function formatUSDT(amount: bigint): string {
  const divisor = BigInt(10 ** USDT_DECIMALS);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(USDT_DECIMALS, '0').slice(0, 2);
  return `${whole}.${fractionStr}`;
}

export function parseUSDT(amount: string | number): bigint {
  const amountStr = typeof amount === 'number' ? amount.toString() : amount;
  const [whole = '0', fraction = '0'] = amountStr.split('.');
  const paddedFraction = fraction.padEnd(USDT_DECIMALS, '0').slice(0, USDT_DECIMALS);
  return BigInt(whole) * BigInt(10 ** USDT_DECIMALS) + BigInt(paddedFraction);
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
