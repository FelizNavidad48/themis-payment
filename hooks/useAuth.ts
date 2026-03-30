import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const signIn = async () => {
    if (!address || !isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsAuthenticating(true);
    try {
      const nonceResponse = await fetch('/api/auth/nonce');
      const { nonce } = await nonceResponse.json();

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Themis Payment',
        uri: window.location.origin,
        version: '1',
        chainId: 137,
        nonce,
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.toJSON(),
          signature,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Verification failed');
      }

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsAuthenticating(false);
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
    signIn,
    signOut,
    address,
  };
}
