# Themis - Global P2P Payment Platform

## Deployed App: https://themis-payment.vercel.app/dashboard

A decentralized peer-to-peer payment platform for cross-border USDT transfers on Polygon.

## Features

- 🌍 **Cross-border payments** - Send USDT globally with near-instant settlement
- ⚡ **Low fees** - Leverages Polygon's low gas costs (typically < $0.01)
- 🔒 **Non-custodial** - Your keys, your crypto
- 💼 **Payment requests** - Create shareable payment links
- 🎨 **Modern UI** - Beautiful, intuitive interface built with Next.js and Tailwind

## How It Works

### For Recipients (Request Payment)
1. Connect your wallet
2. Enter the amount you want to receive
3. Add an optional memo
4. Share the generated link with the payer

### For Senders (Pay Request)
1. Open the payment request link
2. Connect your wallet
3. Review the payment details
4. Approve the transaction

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi, Viem, RainbowKit
- **Blockchain**: Polygon (USDT)
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Web3 wallet (MetaMask, Coinbase Wallet, etc.)
- Some MATIC for gas fees (on Polygon)
- USDT on **Polygon network** to test payments

**⚠️ IMPORTANT**: You must be on **Polygon network**, not Ethereum! See [WALLET_SETUP.md](WALLET_SETUP.md) for complete wallet configuration instructions.

### Installation

1. Clone the repository and navigate to the project:

```bash
cd themis-payment
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Get a WalletConnect Project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com/) and add it to `.env.local`:

```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

5. Run the development server:

```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Testing on Polygon Mainnet

The app is configured for Polygon mainnet. To test:

1. Add Polygon network to your wallet
2. Get MATIC for gas fees (bridge from Ethereum or buy on exchanges)
3. Get USDT on Polygon (bridge or buy)

### Contract Addresses

- **USDT on Polygon**: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

## Project Structure

```
themis-payment/
├── app/
│   ├── request/
│   │   ├── create/      # Create payment request page
│   │   └── pay/         # Pay request page
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   ├── providers.tsx    # Web3 providers
│   └── globals.css      # Global styles
├── components/          # Reusable components
├── lib/
│   ├── wagmi.ts        # Wagmi configuration
│   └── constants.ts    # Contract addresses and ABIs
├── utils/
│   └── format.ts       # Formatting utilities
└── public/             # Static assets
```

## Development

### Available Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Security Considerations

- This is an MVP/prototype for educational purposes
- Always verify transaction details before confirming
- Keep your private keys secure
- Test with small amounts first
- Be aware of smart contract risks

## Roadmap

- [ ] Transaction history
- [ ] QR code generation for payment requests
- [ ] Multi-stablecoin support (USDC, DAI)
- [ ] Multi-chain support (Ethereum L2s)
- [ ] ENS integration
- [ ] Mobile responsive improvements
- [ ] Real-time notifications

## License

MIT
