# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Get WalletConnect Project ID

1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID

### 3. Configure Environment

Edit `.env.local` and add your Project ID:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing the App

### What You Need

1. **Wallet**: MetaMask or any Web3 wallet
2. **Network**: Polygon Mainnet configured in your wallet
3. **MATIC**: For gas fees (~$0.01 per transaction)
4. **USDT**: On Polygon network to test payments

### Getting Test Funds

#### Option 1: Bridge from Ethereum
- Use [Polygon Bridge](https://wallet.polygon.technology/bridge)
- Bridge USDT from Ethereum to Polygon

#### Option 2: Buy on Exchange
- Buy MATIC and USDT on exchanges like:
  - Binance
  - Coinbase
  - Kraken
- Withdraw to Polygon network

### Testing Flow

1. **As Recipient** (request payment):
   - Connect your wallet
   - Click "Request Payment"
   - Enter amount (e.g., 1.00 USDT)
   - Add memo (optional)
   - Copy the generated link

2. **As Sender** (pay request):
   - Open the payment link (or use a different wallet)
   - Connect wallet
   - Review payment details
   - Click "Pay" and confirm in wallet
   - Wait for transaction confirmation

## Polygon Network Setup

If you don't have Polygon configured in your wallet:

### Network Details
- **Network Name**: Polygon Mainnet
- **RPC URL**: https://polygon-rpc.com
- **Chain ID**: 137
- **Currency Symbol**: MATIC
- **Block Explorer**: https://polygonscan.com

### Add to MetaMask
1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Enter the details above
5. Save

## Troubleshooting

### "Insufficient USDT balance"
- Make sure you have USDT on Polygon (not Ethereum)
- Check balance at [polygonscan.com](https://polygonscan.com)

### "Insufficient MATIC for gas"
- Get some MATIC for gas fees
- Usually need ~0.01 MATIC per transaction

### "Transaction failed"
- Check you're on Polygon network
- Verify you have enough USDT and MATIC
- Try increasing gas limit in wallet

### "Cannot connect wallet"
- Check WalletConnect Project ID is set in `.env.local`
- Make sure wallet extension is unlocked
- Try refreshing the page

## Development Tips

### Project Structure
```
app/
  ├── page.tsx              # Home page
  ├── request/
  │   ├── create/page.tsx   # Create payment request
  │   └── pay/page.tsx      # Pay request
  └── providers.tsx         # Web3 providers setup

lib/
  ├── wagmi.ts             # Wagmi config
  └── constants.ts         # USDT contract details

utils/
  └── format.ts            # Helper functions
```

### Key Files to Customize

- **lib/wagmi.ts**: Change networks or add chains
- **lib/constants.ts**: Add more stablecoins or change contract
- **app/globals.css**: Modify color scheme
- **tailwind.config.ts**: Customize theme colors

## Next Steps

After getting the basic flow working, you can:

1. Add transaction history
2. Implement QR code generation
3. Add support for more stablecoins (USDC, DAI)
4. Add ENS name resolution
5. Implement real-time notifications
6. Add multi-language support

## Need Help?

- Check the main [README.md](README.md)
- Review [Wagmi docs](https://wagmi.sh)
- Check [RainbowKit docs](https://rainbowkit.com)
- Review [Next.js docs](https://nextjs.org/docs)
