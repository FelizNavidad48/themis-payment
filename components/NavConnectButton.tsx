'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export function NavConnectButton() {
  const { isConnecting, isReconnecting } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = !mounted || isConnecting || isReconnecting;

  if (isLoading) {
    return <div className="h-10 w-[140px] bg-white/10 rounded-xl animate-shimmer"></div>;
  }

  return <ConnectButton />;
}
