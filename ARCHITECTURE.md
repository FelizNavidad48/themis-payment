# Themis Architecture Documentation

## Overview

Themis is a decentralized P2P payment platform built on Next.js that enables instant cross-border USDT transfers on Polygon with minimal fees.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│              (Next.js 15 + React 19)                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ RainbowKit + Wagmi
                      │
┌─────────────────────▼───────────────────────────────────┐
│                Web3 Provider Layer                       │
│        (Wallet Connection & Transaction Management)      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ JSON-RPC / Viem
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Polygon Network                         │
│            (USDT Smart Contract)                         │
└──────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **RainbowKit**: Wallet connection UI

### Web3 Integration
- **Wagmi v2**: React hooks for Ethereum
- **Viem**: Low-level Ethereum interactions
- **TanStack Query**: Async state management

### Blockchain
- **Polygon**: Layer 2 scaling solution
- **USDT Contract**: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

## Core Components

### 1. Payment Request Flow

```
Recipient                           System                          Sender
    │                                 │                               │
    │ 1. Connect Wallet               │                               │
    ├────────────────────────────────>│                               │
    │                                 │                               │
    │ 2. Create Request               │                               │
    │    (amount, memo)               │                               │
    ├────────────────────────────────>│                               │
    │                                 │                               │
    │ 3. Generate Link                │                               │
    │<────────────────────────────────┤                               │
    │                                 │                               │
    │ 4. Share Link                   │                               │
    ├─────────────────────────────────┼──────────────────────────────>│
    │                                 │                               │
    │                                 │ 5. Open Link                  │
    │                                 │<──────────────────────────────┤
    │                                 │                               │
    │                                 │ 6. Connect Wallet             │
    │                                 │<──────────────────────────────┤
    │                                 │                               │
    │                                 │ 7. Review & Approve           │
    │                                 │<──────────────────────────────┤
    │                                 │                               │
    │                                 │ 8. Submit Transaction         │
    │                                 │   to Polygon                  │
    │                                 ├──────────────────────────────>│
    │                                 │                               │
    │ 9. Receive USDT                 │                               │
    │<────────────────────────────────┴───────────────────────────────┘
```

### 2. Key Files & Responsibilities

#### `/lib/wagmi.ts`
- Configures Wagmi with Polygon network
- Sets up WalletConnect integration
- Defines supported chains

#### `/lib/constants.ts`
- USDT contract address
- Contract ABI (only required functions)
- Token decimals (6 for USDT)

#### `/utils/format.ts`
- `formatUSDT()`: Convert bigint to human-readable amount
- `parseUSDT()`: Convert user input to wei/smallest unit
- `shortenAddress()`: Display-friendly address format

#### `/app/providers.tsx`
- Wraps app with Web3 providers
- Sets up RainbowKit theme
- Configures TanStack Query

#### `/app/request/create/page.tsx`
**Purpose**: Create payment requests

**Flow**:
1. User enters amount and optional memo
2. On submit, encodes data into URL parameters
3. Redirects to `/request/pay?recipient=...&amount=...&memo=...`

**State**:
- `amount`: Payment amount in USDT
- `memo`: Optional description
- `address`: Connected wallet address (recipient)

#### `/app/request/pay/page.tsx`
**Purpose**: Pay requests

**Flow**:
1. Parse URL parameters (recipient, amount, memo)
2. Display payment details
3. On "Pay", call USDT contract's `transfer()` function
4. Show transaction status and confirmation

**State**:
- `hash`: Transaction hash (from writeContract)
- `isPending`: Transaction submission in progress
- `isConfirming`: Waiting for block confirmation
- `isSuccess`: Transaction confirmed
- `error`: Error object if transaction fails

**Smart Contract Interaction**:
```typescript
writeContract({
  address: USDT_ADDRESS,
  abi: USDT_ABI,
  functionName: 'transfer',
  args: [recipient, amountInWei],
});
```

## Data Flow

### Payment Request Creation

```
User Input (amount, memo)
    │
    ▼
URL Parameters Encoding
    │
    ▼
/request/pay?recipient={address}&amount={amount}&memo={memo}
    │
    ▼
Shareable Link
```

### Payment Execution

```
URL Parameters
    │
    ▼
Parse & Validate
    │
    ▼
Display Review Screen
    │
    ▼
User Confirms
    │
    ▼
parseUSDT(amount) → BigInt
    │
    ▼
writeContract(transfer, [recipient, amount])
    │
    ▼
Wallet Signature Request
    │
    ▼
Transaction Submitted to Polygon
    │
    ▼
Wait for Confirmation
    │
    ▼
Success / Error Screen
```

## Smart Contract Interactions

### USDT Contract (ERC-20)

**Contract**: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

**Functions Used**:

1. **balanceOf(address)**
   - Returns: uint256 (balance in smallest unit)
   - Used for: Checking user balance before transfer

2. **transfer(address, uint256)**
   - Params: recipient address, amount
   - Returns: bool (success)
   - Used for: Sending USDT

3. **decimals()**
   - Returns: uint8 (6 for USDT on Polygon)
   - Used for: Amount conversions

### Transaction Lifecycle

```
1. User approves transaction in wallet
2. Transaction submitted to Polygon mempool
3. Miner includes transaction in block
4. Block confirmed (~2 seconds on Polygon)
5. Transaction receipt available
6. UI updates to success state
```

## Error Handling

### User-Friendly Error Translation

The app translates technical blockchain errors into user-friendly messages:

| Blockchain Error | User Message |
|-----------------|--------------|
| "insufficient funds" | "Insufficient USDT balance in your wallet" |
| "user rejected" | "Transaction was rejected" |
| "gas" related | "Insufficient MATIC for gas fees" |
| Other errors | "Transaction failed. Please try again." |

### Error Sources

1. **Wallet Errors**: User rejection, locked wallet
2. **Balance Errors**: Insufficient USDT or MATIC
3. **Network Errors**: RPC issues, network congestion
4. **Contract Errors**: Invalid parameters, contract failures

## Security Considerations

### Current Implementation

✅ **Non-custodial**: No private keys stored
✅ **Client-side validation**: Amount and address validation
✅ **Direct contract interaction**: No intermediary smart contracts
✅ **Transparent transactions**: All txs visible on Polygonscan

### Limitations (MVP)

⚠️ **No transaction history**: No persistent storage
⚠️ **Ephemeral requests**: Links contain all data, no server state
⚠️ **No request expiry**: Links valid indefinitely
⚠️ **No multi-sig**: Single-signature transactions only

## Performance Characteristics

### Transaction Speed
- **Polygon block time**: ~2 seconds
- **Confirmation time**: ~2-5 seconds typical
- **Gas cost**: ~$0.001-0.01 USD per transaction

### Application Performance
- **First load**: ~1-2 seconds (Next.js optimization)
- **Route transitions**: Instant (client-side routing)
- **Wallet connection**: 2-5 seconds (varies by wallet)

## State Management

### Wagmi Hooks Used

- `useAccount()`: Get connected wallet address and status
- `useWriteContract()`: Initiate blockchain transactions
- `useWaitForTransactionReceipt()`: Monitor transaction status
- `useReadContract()`: Read contract state (future use)

### TanStack Query

- Caches blockchain data
- Automatic refetching on window focus
- Optimistic updates for better UX

## Deployment Considerations

### Environment Variables
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<required>
```

### Build Configuration
- Static export NOT supported (needs API routes for potential future features)
- Vercel/Netlify compatible
- Edge runtime compatible

### Network Requirements
- Polygon RPC endpoint (default: public RPC)
- WalletConnect relay servers
- IPFS (optional, for future decentralized hosting)

## Future Architecture Extensions

### Phase 2: Persistence Layer
```
Next.js API Routes
    │
    ▼
PostgreSQL / Supabase
    │
    ▼
Transaction History
Request Management
User Profiles
```

### Phase 3: Real-time Features
```
WebSocket Server
    │
    ▼
Real-time Status Updates
Push Notifications
Live Request Feed
```

### Phase 4: Multi-chain
```
Current: Polygon Only
    │
    ▼
Future: Ethereum, Arbitrum, Optimism, Base
    │
    ▼
Cross-chain Bridge Integration
```

## Testing Strategy

### Manual Testing Checklist

1. **Wallet Connection**
   - [ ] Connect MetaMask
   - [ ] Connect WalletConnect wallets
   - [ ] Disconnect wallet
   - [ ] Switch networks

2. **Request Creation**
   - [ ] Create request with amount only
   - [ ] Create request with memo
   - [ ] Invalid amount handling
   - [ ] Copy link functionality

3. **Payment Execution**
   - [ ] Pay valid request
   - [ ] Reject transaction in wallet
   - [ ] Insufficient USDT balance
   - [ ] Insufficient MATIC for gas
   - [ ] Invalid/expired links

4. **UI/UX**
   - [ ] Mobile responsiveness
   - [ ] Dark mode
   - [ ] Loading states
   - [ ] Error messages

### Automated Testing (Future)

```typescript
// Example test structure
describe('Payment Flow', () => {
  it('should create payment request');
  it('should parse payment link correctly');
  it('should execute transfer on payment');
  it('should handle errors gracefully');
});
```

## Monitoring & Analytics

### Key Metrics to Track

1. **Usage**
   - Payment requests created
   - Successful payments
   - Failed transactions

2. **Performance**
   - Page load times
   - Transaction confirmation times
   - Error rates

3. **User Behavior**
   - Wallet types used
   - Average transaction size
   - Drop-off points

### Recommended Tools

- **Vercel Analytics**: Page views, performance
- **Dune Analytics**: On-chain transaction data
- **Sentry**: Error tracking
- **PostHog**: User behavior analytics

## Conclusion

This architecture prioritizes simplicity and demonstration of core functionality. The MVP proves the concept of blockchain-based cross-border payments with minimal complexity, setting a foundation for future enhancements.
