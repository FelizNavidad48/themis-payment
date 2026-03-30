// USDT Contract Address on Polygon Mainnet
export const USDT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as const;

// USDT has 6 decimals on Polygon
export const USDT_DECIMALS = 6;

// USDT ABI - only the functions we need
export const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;
