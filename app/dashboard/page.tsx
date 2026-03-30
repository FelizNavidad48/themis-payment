'use client';

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AppNav } from '@/components/AppNav';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { shortenAddress } from '@/utils/format';

type PaymentLink = {
  id: string;
  amount: string;
  memo: string | null;
  short_url: string;
  qr_code_url: string | null;
  created_at: string;
  expires_at: string | null;
  status: 'active' | 'expired' | 'completed';
};

type Transaction = {
  id: string;
  payment_link_id: string;
  sender_wallet_address: string;
  tx_hash: string;
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  confirmed_at: string | null;
};

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, signIn, isAuthenticating, isCheckingAuth } = useAuth();
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'links' | 'transactions'>('links');

  useEffect(() => {
    if (isAuthenticated && address) {
      loadData();
    } else if (!isCheckingAuth) {
      setIsLoading(false);
    }
  }, [isAuthenticated, address, isCheckingAuth]);

  const loadData = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const { data: links } = await supabase
        .from('payment_links')
        .select('*')
        .eq('creator_wallet_address', address.toLowerCase())
        .order('created_at', { ascending: false });

      setPaymentLinks(links || []);

      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('sender_wallet_address', address.toLowerCase())
        .order('created_at', { ascending: false });

      setTransactions(txs || []);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setIsLoading(false);
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
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="mb-8">
                <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                <div className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to view your dashboard</p>
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
          <p className="text-gray-600 mb-6">Please sign in with your wallet to access your dashboard</p>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      <AppNav />

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">
                Manage your payment links and view transaction history
              </p>
            </div>

            <div className="mb-6 flex gap-4">
              <Link
                href="/request/create"
                className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                Create Payment Request
              </Link>
            </div>

            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('links')}
                  className={`pb-4 px-2 font-semibold transition-colors ${
                    activeTab === 'links'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Payment Links ({paymentLinks.length})
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`pb-4 px-2 font-semibold transition-colors ${
                    activeTab === 'transactions'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Transactions ({transactions.length})
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : activeTab === 'links' ? (
              <div className="space-y-4">
                {paymentLinks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-600 mb-4">No payment links yet</p>
                    <Link
                      href="/request/create"
                      className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Create Your First Link
                    </Link>
                  </div>
                ) : (
                  paymentLinks.map((link) => (
                    <div
                      key={link.id}
                      className="border border-gray-200 rounded-xl p-6 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            ${link.amount} USDT
                          </div>
                          {link.memo && (
                            <div className="text-gray-600 text-sm">{link.memo}</div>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            link.status
                          )}`}
                        >
                          {link.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Created</span>
                          <span className="text-gray-900">{formatDate(link.created_at)}</span>
                        </div>
                        {link.expires_at && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Expires</span>
                            <span className="text-gray-900">
                              {formatDate(link.expires_at)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="text-xs text-gray-600 mb-1">Payment Link</div>
                        <div className="font-mono text-sm text-gray-900 break-all">
                          {window.location.origin}/request/pay?link={link.short_url}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/request/pay?link=${link.short_url}`;
                            navigator.clipboard.writeText(url);
                            toast.success('Link copied to clipboard!');
                          }}
                          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                        >
                          Copy Link
                        </button>
                        {link.qr_code_url && (
                          <button
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = link.qr_code_url!;
                              a.download = `qr-code-${link.short_url}.png`;
                              a.click();
                            }}
                            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                          >
                            Download QR
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💸</div>
                    <p className="text-gray-600">No transactions yet</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="border border-gray-200 rounded-xl p-6 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            ${tx.amount} USDT
                          </div>
                          <div className="text-gray-600 text-sm">
                            Sent to {shortenAddress(tx.sender_wallet_address)}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            tx.status
                          )}`}
                        >
                          {tx.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sent</span>
                          <span className="text-gray-900">{formatDate(tx.created_at)}</span>
                        </div>
                        {tx.confirmed_at && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Confirmed</span>
                            <span className="text-gray-900">
                              {formatDate(tx.confirmed_at)}
                            </span>
                          </div>
                        )}
                      </div>

                      <a
                        href={`https://polygonscan.com/tx/${tx.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View on Polygonscan →
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
