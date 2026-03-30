import { useState, useEffect, useRef } from 'react';
import { useAccount, useSignMessage, useWalletClient, useSwitchChain } from 'wagmi';
import { SiweMessage } from 'siwe';
import { polygon } from 'wagmi/chains';

export function useAuth() {
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const mountedRef = useRef(true);
  const checkAuthTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (checkAuthTimeoutRef.current) {
        clearTimeout(checkAuthTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      checkAuth();
    } else {
      setIsCheckingAuth(false);
      setIsAuthenticated(false);
    }
  }, [isConnected, address]);

  const checkAuth = async () => {
    if (!mountedRef.current) return;

    setIsCheckingAuth(true);
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (mountedRef.current) {
        setIsAuthenticated(data.authenticated);
      }
    } catch (error) {
      if (mountedRef.current) {
        setIsAuthenticated(false);
      }
    } finally {
      if (mountedRef.current) {
        setIsCheckingAuth(false);
      }
    }
  };

  const signIn = async () => {
    if (!address || !isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsAuthenticating(true);
    try {
      if (chain?.id !== polygon.id && switchChainAsync) {
        await switchChainAsync({ chainId: polygon.id });
      }

      let currentAddress = address;

      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        currentAddress = accounts[0];
      }

      const nonceResponse = await fetch('/api/auth/nonce');
      const { nonce } = await nonceResponse.json();

      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: currentAddress,
        statement: 'Sign in to Themis Payment',
        uri: window.location.origin,
        version: '1',
        chainId: 137,
        nonce,
      });

      const messageText = siweMessage.prepareMessage();

      const signature = await signMessageAsync({
        message: messageText,
      });

      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          signature,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Verification failed');
      }

      if (mountedRef.current) {
        setIsAuthenticated(true);
      }
      return true;
    } catch (error) {
      if (mountedRef.current) {
        setIsAuthenticated(false);
      }
      throw error;
    } finally {
      if (mountedRef.current) {
        setIsAuthenticating(false);
      }
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    isAuthenticated,
    isAuthenticating,
    isCheckingAuth,
    signIn,
    signOut,
    address,
  };
}
