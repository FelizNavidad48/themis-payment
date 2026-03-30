'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-white font-mono text-sm">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        const injectedConnector = connectors.find(c => c.type === 'injected');
        if (injectedConnector) {
          connect({ connector: injectedConnector });
        }
      }}
      className="bg-white text-primary-600 px-6 py-2 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
    >
      Connect Wallet
    </button>
  );
}
