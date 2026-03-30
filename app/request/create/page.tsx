'use client';

import { useState, useRef, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NavConnectButton } from '@/components/NavConnectButton';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useAuth } from '@/hooks/useAuth';

export default function CreateRequest() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, signIn, isAuthenticating, isCheckingAuth } = useAuth();
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [expiresIn, setExpiresIn] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (paymentLink && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        paymentLink,
        {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [paymentLink]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !amount || !isAuthenticated) return;

    setIsCreating(true);
    try {
      const shortUrl = Math.random().toString(36).substring(2, 10);
      const expiresAt = expiresIn
        ? new Date(Date.now() + parseInt(expiresIn) * 60 * 60 * 1000).toISOString()
        : null;

      const qrCanvas = document.createElement('canvas');
      const fullUrl = `${window.location.origin}/request/pay?link=${shortUrl}`;
      await QRCode.toCanvas(qrCanvas, fullUrl, { width: 256 });
      const qrDataUrl = qrCanvas.toDataURL();

      const response = await fetch('/api/payment-links/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          memo: memo || null,
          shortUrl: shortUrl,
          qrCodeUrl: qrDataUrl,
          expiresAt: expiresAt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Create payment link error:', errorData);
        alert('Failed to create payment link. Please try again.');
        return;
      }

      await response.json();

      setPaymentLink(fullUrl);
    } catch (error) {
      console.error('Create request error:', error);
      alert('Failed to create payment link. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
        <nav className="p-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Themis
          </Link>
          <div className="w-40 h-10 bg-white/10 rounded-xl animate-pulse"></div>
        </nav>
        <div className="flex items-center justify-center px-6 pt-20">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to create a payment request</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in with your wallet to create payment requests</p>
          <button
            onClick={signIn}
            disabled={isAuthenticating}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isAuthenticating ? 'Signing In...' : 'Sign In with Wallet'}
          </button>
        </div>
      </div>
    );
  }

  if (paymentLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
        <nav className="p-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Themis
          </Link>
          <ConnectButton />
        </nav>

        <main className="container mx-auto px-6 py-12">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">✅</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Payment Link Created!
                </h1>
                <p className="text-gray-600">Share this link to receive payment</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
                <canvas ref={canvasRef} className="mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">Scan QR code or share link below</p>

                <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-mono break-all text-gray-900">{paymentLink}</p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(paymentLink);
                    alert('Link copied to clipboard!');
                  }}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                  Copy Link
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold text-gray-900">{amount} USDT</span>
                </div>
                {memo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Memo</span>
                    <span className="text-gray-900">{memo}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPaymentLink('');
                    setQrCodeUrl('');
                    setAmount('');
                    setMemo('');
                    setExpiresIn('');
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Create Another
                </button>
                <Link
                  href="/dashboard"
                  className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors text-center"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      <nav className="p-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          Themis
        </Link>
        <NavConnectButton />
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Request Payment
            </h1>

            <form onSubmit={handleCreateRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USDT)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Memo (Optional)
                </label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="What's this for?"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Expiration (Optional)
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Never expires</option>
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="24">24 hours</option>
                  <option value="168">7 days</option>
                  <option value="720">30 days</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Your Address</span>
                  <span className="font-mono text-gray-900">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Network</span>
                  <span className="text-gray-900 font-medium">Polygon</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Generate Payment Request'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
