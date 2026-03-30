import { useState, useEffect } from 'react';
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
      // Make sure we're on Polygon network
      if (chain?.id !== polygon.id && switchChainAsync) {
        console.log('Switching to Polygon network...');
        await switchChainAsync({ chainId: polygon.id });
      }

      // Get the current connected account from MetaMask
      let currentAddress = address;

      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        currentAddress = accounts[0];
      }

      console.log('Address from useAccount:', address);
      console.log('Address from MetaMask:', currentAddress);

      const nonceResponse = await fetch('/api/auth/nonce');
      const { nonce } = await nonceResponse.json();

      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: currentAddress, // Use the address directly from MetaMask
        statement: 'Sign in to Themis Payment',
        uri: window.location.origin,
        version: '1',
        chainId: 137,
        nonce,
      });

      const messageText = siweMessage.prepareMessage();

      console.log('About to request signature for message:', messageText);
      console.log('Address:', address);

      const signature = await signMessageAsync({
        message: messageText,
      });

      console.log('Signature received:', signature);

      console.log('Sending message text to verify:', messageText);
      console.log('Signature:', signature);

      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText, // Send the EXACT text that was signed
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
