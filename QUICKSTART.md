# Themis - 5-Minute Quick Start

Get Themis running in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] MetaMask wallet installed in browser
- [ ] 5 minutes of time

## Step 1: Install (2 minutes)

```bash
cd themis-payment
pnpm install
```

## Step 2: Configure (1 minute)

### Get WalletConnect ID

1. Go to: https://cloud.walletconnect.com/
2. Sign in with GitHub/Google/Email
3. Click "Create Project"
4. Name it "Themis Test"
5. Copy the Project ID

### Add to Environment

Edit `.env.local`:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=paste_your_id_here
```

## Step 3: Run (1 minute)

```bash
pnpm dev
```

Open: http://localhost:3000

## Step 4: Test (1 minute)

### Connect Wallet

1. Click "Connect Wallet"
2. Choose MetaMask
3. Approve connection
4. Switch to Polygon network (if prompted)

### Create Payment Request

1. Click "Request Payment"
2. Enter: `1.00`
3. Memo: `Test payment`
4. Click "Generate Payment Request"
5. Copy the link

### Pay Request

1. Open the link in a new tab (or different browser)
2. Connect wallet
3. Click "Pay 1.00 USDT"
4. Approve in MetaMask
5. Wait ~5 seconds for confirmation

## Done! 🎉

You've successfully sent a cross-border USDT payment on Polygon!

---

## Troubleshooting

### "pnpm: command not found"

Install pnpm:
```bash
npm install -g pnpm
```

### "Wrong network"

Add Polygon to MetaMask:
- Network: Polygon Mainnet
- RPC: https://polygon-rpc.com
- Chain ID: 137
- Currency: MATIC

### "Insufficient USDT"

Get USDT on Polygon:
1. Bridge from Ethereum: https://wallet.polygon.technology/
2. Or use a testnet version (requires code changes)

### "Insufficient MATIC"

Get MATIC for gas:
1. Bridge from Ethereum
2. Or buy from exchanges (Binance, Coinbase)

### "Installation taking too long"

Use npm instead:
```bash
npm install
npm run dev
```

---

## What's Next?

- Read [README.md](README.md) for full documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for feature overview

## Need Help?

Check:
- [SETUP.md](SETUP.md) - Detailed setup guide
- [Next.js Docs](https://nextjs.org/docs)
- [RainbowKit Docs](https://rainbowkit.com)
- [Polygon Docs](https://docs.polygon.technology)
