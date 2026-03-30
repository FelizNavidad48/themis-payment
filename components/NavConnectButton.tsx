'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export function NavConnectButton() {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setInitialCheckDone(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = !mounted || isConnecting || isReconnecting || (!isConnected && !initialCheckDone);

  if (isLoading) {
    return <div className="h-10 w-[140px] bg-white/10 rounded-xl animate-shimmer"></div>;
  }

  return <ConnectButton />;
}
