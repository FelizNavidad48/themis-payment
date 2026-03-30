'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function NavConnectButton() {
  const [mounted, setMounted] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !showButton) {
    return <div className="h-10 w-[140px] bg-white/10 rounded-xl animate-shimmer"></div>;
  }

  return <ConnectButton />;
}
