# Wallet Setup Guide

## Quick Answer to Your Questions

### Q: Do I need to be on Ethereum or Polygon?
**A: POLYGON** - The app only works on Polygon mainnet.

### Q: Why does it show "1 Unknown" in my wallet?
**A: This is normal!** MetaMask doesn't always recognize USDT contract calls. The transaction will still send the correct amount of USDT. To fix the display, add USDT as a custom token (instructions below).

---

## Step 1: Switch to Polygon Network

### If Polygon is Already in Your Wallet:
1. Open MetaMask
2. Click the network dropdown (top)
3. Select "Polygon Mainnet"

### If You Need to Add Polygon:
1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Enter these details:

```
Network Name: Polygon Mainnet
RPC URL: https://polygon-rpc.com
Chain ID: 137
Currency Symbol: MATIC
Block Explorer: https://polygonscan.com
```

5. Click "Save"

---

## Step 2: Add USDT Token to MetaMask

This will fix the "Unknown" display issue!

### Automatic Method (Recommended):
1. Go to https://polygonscan.com/token/0xc2132D05D31c914a87C6611C10748AEb04B58e8F
2. Click "Add to MetaMask" button (if available)
3. Approve in MetaMask

### Manual Method:
1. Open MetaMask
2. Make sure you're on **Polygon network**
3. Scroll down to "Tokens" section
4. Click "Import tokens"
5. Enter these details:

```
Token Contract Address: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F
Token Symbol: USDT
Token Decimals: 6
```

6. Click "Add Custom Token"
7. Click "Import Tokens"

**Now USDT will show correctly in your wallet!**

---

## Step 3: Get USDT on Polygon

You need USDT on the **Polygon network**, not Ethereum!

### Option 1: Bridge from Ethereum
If you have USDT on Ethereum:

1. Go to https://wallet.polygon.technology/polygon/bridge/deposit
2. Connect wallet
3. Select USDT
4. Enter amount
5. Approve and bridge (takes ~7-8 minutes)

### Option 2: Buy on Exchange
Buy on a CEX and withdraw to Polygon:

**Binance:**
1. Buy USDT
2. Withdraw → Select "Polygon" network
3. Enter your wallet address
4. Withdraw

**Coinbase:**
1. Buy USDC on Polygon (or swap to USDT later)
2. Send to your wallet

**Crypto.com:**
1. Buy USDT
2. Withdraw → Select "Polygon" network
3. Send to wallet

### Option 3: Swap on Polygon
If you have other tokens on Polygon:

1. Go to https://app.uniswap.org/
2. Connect wallet (make sure on Polygon)
3. Swap MATIC or other tokens → USDT
4. Confirm transaction

---

## Step 4: Get MATIC for Gas

You need a small amount of MATIC (~0.1-0.5) for transaction fees.

### If You Have Tokens on Polygon:
1. Keep some MATIC from bridging
2. Or swap a small amount on Uniswap

### If Starting Fresh:
**Easiest:** Buy MATIC on exchange and withdraw to Polygon

**Binance/Coinbase/Kraken:**
1. Buy MATIC
2. Withdraw → Select "Polygon" network
3. Send to your wallet

---

## Common Issues & Solutions

### Issue: "Wrong Network" Error
**Solution:**
- Open MetaMask
- Switch to Polygon network (not Ethereum!)
- Refresh the page

### Issue: "Insufficient USDT Balance"
**Solution:**
- Check you have USDT on **Polygon** (not Ethereum)
- Add USDT token to MetaMask to see balance
- Bridge or buy USDT on Polygon

### Issue: "Insufficient MATIC for Gas"
**Solution:**
- Get MATIC on Polygon network
- You need ~0.01-0.05 MATIC per transaction
- Keep at least 0.1 MATIC in wallet

### Issue: Wallet Shows "Unknown" Token
**Solution:**
- This is cosmetic - transaction still works!
- To fix display: Add USDT as custom token (see Step 2)
- Contract: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

### Issue: Transaction Stuck
**Solution:**
- Check you approved the transaction in MetaMask
- Check you have enough MATIC for gas
- Check Polygon network isn't congested: https://polygonscan.com

---

## Verifying Your Setup

Before testing payments, verify:

- [ ] MetaMask on Polygon network (not Ethereum!)
- [ ] USDT token added to MetaMask
- [ ] Can see your USDT balance
- [ ] Have at least 0.1 MATIC for gas
- [ ] Connected to Themis app

---

## Testing Checklist

### Test with Small Amount First!

1. [ ] Create payment request for 0.1 USDT
2. [ ] Open link in new tab
3. [ ] Connect wallet (should show Polygon)
4. [ ] Click "Pay"
5. [ ] Wallet popup shows transaction
   - May show "Unknown" - this is OK!
   - Check amount matches (0.1)
6. [ ] Confirm transaction
7. [ ] Wait ~5 seconds
8. [ ] See success message
9. [ ] Check Polygonscan link
10. [ ] Verify USDT transferred

**If test works, you're ready for real transactions!**

---

## Quick Reference

### USDT on Polygon
- **Contract**: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- **Symbol**: USDT
- **Decimals**: 6
- **View on Polygonscan**: https://polygonscan.com/token/0xc2132D05D31c914a87C6611C10748AEb04B58e8F

### Polygon Network
- **Chain ID**: 137
- **RPC**: https://polygon-rpc.com
- **Explorer**: https://polygonscan.com
- **Currency**: MATIC

### Useful Links
- **Add USDT to MetaMask**: https://polygonscan.com/token/0xc2132D05D31c914a87C6611C10748AEb04B58e8F
- **Bridge to Polygon**: https://wallet.polygon.technology/polygon/bridge
- **Swap on Polygon**: https://app.uniswap.org/
- **Buy Crypto**: Binance, Coinbase, Crypto.com

---

## Why "Unknown" Shows in Wallet

When you interact with a token contract (like USDT), MetaMask sees:
- A contract call to address `0xc2132...`
- A `transfer` function
- An amount in wei/smallest units

Unless you've added USDT as a custom token, MetaMask doesn't know what token this is, so it shows "Unknown".

**The transaction still works perfectly!** The correct amount of USDT will transfer.

To fix the display, simply add USDT as a custom token (see Step 2 above).

---

## Summary

1. **Use Polygon network** (not Ethereum)
2. **Add USDT token** to MetaMask for correct display
3. **Get USDT on Polygon** (bridge or buy)
4. **Keep MATIC** for gas fees
5. **Test with small amount** first

**You're all set!** 🚀
