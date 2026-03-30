'use client';

import { Suspense, useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NavConnectButton } from '@/components/NavConnectButton';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSimulateContract, useReadContract, useBalance } from 'wagmi';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { USDT_ADDRESS, USDT_ABI } from '@/lib/constants';
import { parseUSDT, shortenAddress } from '@/utils/format';
import { supabase } from '@/lib/supabase';

function PayRequestContent() {
  const { address, isConnected, chain } = useAccount();
  const searchParams = useSearchParams();

  const linkId = searchParams.get('link');
  const [recipient, setRecipient] = useState<`0x${string}` | null>(searchParams.get('recipient') as `0x${string}`);
  const [amount, setAmount] = useState<string | null>(searchParams.get('amount'));
  const [memo, setMemo] = useState<string | null>(searchParams.get('memo'));
  const [paymentLinkId, setPaymentLinkId] = useState<string | null>(null);
  const [isLoadingLink, setIsLoadingLink] = useState(!!linkId);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (linkId) {
      loadPaymentLink();
    }
  }, [linkId]);

  const loadPaymentLink = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_links')
        .select('*')
        .eq('short_url', linkId)
        .single();

      if (error || !data) {
        setErrorMessage('Payment link not found');
        setIsLoadingLink(false);
        return;
      }

      if (data.status === 'expired') {
        setErrorMessage('This payment link has expired');
        setIsLoadingLink(false);
        return;
      }

      if (data.status === 'completed') {
        setErrorMessage('This payment link has already been paid');
        setIsLoadingLink(false);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await supabase
          .from('payment_links')
          .update({ status: 'expired' })
          .eq('id', data.id);
        setErrorMessage('This payment link has expired');
        setIsLoadingLink(false);
        return;
      }

      setRecipient(data.recipient_wallet_address as `0x${string}`);
      setAmount(data.amount);
      setMemo(data.memo);
      setPaymentLinkId(data.id);
      setIsLoadingLink(false);
    } catch (error) {
      console.error('Load payment link error:', error);
      setErrorMessage('Failed to load payment link');
      setIsLoadingLink(false);
    }
  };

  const amountInWei = amount ? parseUSDT(amount) : BigInt(0);

  // Check user's USDT balance
  const { data: usdtBalance } = useReadContract({
    address: USDT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  // Check user's MATIC balance for gas
  const { data: maticBalance } = useBalance({
    address: address,
  });

  // Simulate the contract call to validate and get proper gas estimation
  const { data: simulateData, error: simulateError } = useSimulateContract({
    address: USDT_ADDRESS,
    abi: USDT_ABI,
    functionName: 'transfer',
    args: recipient && amount ? [recipient, amountInWei] : undefined,
    query: {
      enabled: Boolean(recipient && amount && isConnected && usdtBalance && usdtBalance >= amountInWei),
    },
  });

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const hasEnoughUSDT = usdtBalance !== undefined && usdtBalance >= amountInWei;
  const hasEnoughMATIC = maticBalance !== undefined && maticBalance.value > BigInt(0);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handlePay = async () => {
    if (!amount || !recipient || !address) return;

    try {
      setErrorMessage('');

      if (simulateData?.request) {
        writeContract(simulateData.request);
      } else {
        const amountInWei = parseUSDT(amount);
        writeContract({
          address: USDT_ADDRESS,
          abi: USDT_ABI,
          functionName: 'transfer',
          args: [recipient, amountInWei],
        });
      }
    } catch (err) {
      console.error('Transfer error:', err);
      setErrorMessage('Failed to initiate transfer. Please try again.');
    }
  };

  useEffect(() => {
    if (hash && paymentLinkId && address) {
      recordTransaction();
    }
  }, [hash, paymentLinkId, address]);

  const recordTransaction = async () => {
    if (!hash || !paymentLinkId || !address || !amount) return;

    try {
      await supabase.from('transactions').insert({
        payment_link_id: paymentLinkId,
        sender_wallet_address: address.toLowerCase(),
        tx_hash: hash,
        amount: amount,
        status: 'pending',
      });

      if (isSuccess) {
        await supabase.from('transactions')
          .update({ status: 'completed', confirmed_at: new Date().toISOString() })
          .eq('tx_hash', hash);

        await supabase.from('payment_links')
          .update({ status: 'completed' })
          .eq('id', paymentLinkId);
      }
    } catch (error) {
      console.error('Record transaction error:', error);
    }
  };

  const translateError = (error: Error | null): string => {
    if (!error) return '';

    const message = error.message.toLowerCase();

    if (message.includes('insufficient funds') || message.includes('insufficient balance')) {
      return 'Insufficient USDT balance in your wallet';
    }
    if (message.includes('user rejected') || message.includes('user denied')) {
      return 'Transaction was rejected';
    }
    if (message.includes('gas')) {
      return 'Insufficient MATIC for gas fees';
    }

    return 'Transaction failed. Please try again.';
  };

  if (isLoadingLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Payment Request...</h2>
        </div>
      </div>
    );
  }

  if (!recipient || !amount || errorMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {errorMessage || 'Invalid Request'}
          </h2>
          <p className="text-gray-600 mb-6">
            {errorMessage || 'This payment request is invalid or expired.'}
          </p>
          <Link
            href="/"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Sent!</h2>
          <p className="text-gray-600 mb-6">
            Your payment of ${amount} USDT has been successfully sent.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="text-sm text-gray-600 mb-1">Transaction Hash</div>
            <a
              href={`https://polygonscan.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-mono text-sm break-all"
            >
              {hash}
            </a>
          </div>

          <Link
            href="/"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">💸</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Request</h2>
            <p className="text-gray-600">You&apos;ve received a payment request</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Amount</div>
              <div className="text-3xl font-bold text-gray-900">${amount} USDT</div>
            </div>

            {memo && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Description</div>
                <div className="text-gray-900">{memo}</div>
              </div>
            )}

            <div>
              <div className="text-sm text-gray-600 mb-1">Recipient</div>
              <div className="font-mono text-sm text-gray-900">{shortenAddress(recipient || '')}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Connect your wallet to complete this payment</p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if on wrong network
  if (chain && chain.id !== 137) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wrong Network</h2>
          <p className="text-gray-600 mb-4">
            You&apos;re currently on <strong>{chain.name}</strong>. This app only works on <strong>Polygon network</strong>.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-blue-900 mb-2">How to switch:</p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Open your wallet</li>
              <li>Click the network dropdown</li>
              <li>Select &quot;Polygon Mainnet&quot;</li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <div className="flex gap-3">
            <ConnectButton />
          </div>
        </div>
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
              Payment Request
            </h1>

            {memo && (
              <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6">
                <p className="text-sm font-medium text-primary-900 mb-1">Memo</p>
                <p className="text-primary-700">{memo}</p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-4 border-b">
                <span className="text-gray-600">Amount</span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{amount} USDT</div>
                  <div className="text-sm text-gray-500 mt-1">≈ ${amount} USD</div>
                </div>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Token</span>
                <div className="text-right">
                  <div className="text-gray-900 font-medium">USDT (Tether)</div>
                  <div className="text-xs text-gray-500 font-mono">{shortenAddress(USDT_ADDRESS)}</div>
                </div>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Recipient</span>
                <span className="font-mono text-gray-900">{shortenAddress(recipient)}</span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Network</span>
                <div className="text-right">
                  <div className="text-gray-900 font-medium">Polygon</div>
                  <div className="text-xs text-gray-500">Chain ID: 137</div>
                </div>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Your Address</span>
                <span className="font-mono text-gray-900">{address ? shortenAddress(address) : ''}</span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Est. Network Fee</span>
                <span className="text-gray-900">~$0.01 (in MATIC)</span>
              </div>

              <div className="flex justify-between items-center py-3 border-t pt-3">
                <span className="text-gray-600">Your USDT Balance</span>
                <span className={`font-medium ${hasEnoughUSDT ? 'text-green-600' : 'text-red-600'}`}>
                  {usdtBalance !== undefined
                    ? `${(Number(usdtBalance) / 1000000).toFixed(2)} USDT`
                    : 'Loading...'}
                </span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Your MATIC Balance</span>
                <span className={`font-medium ${hasEnoughMATIC ? 'text-green-600' : 'text-red-600'}`}>
                  {maticBalance
                    ? `${Number(maticBalance.value / BigInt(10**18)).toFixed(4)} MATIC`
                    : 'Loading...'}
                </span>
              </div>
            </div>

            {!hasEnoughUSDT && usdtBalance !== undefined && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-sm font-medium text-red-900">
                  ❌ Insufficient USDT Balance
                </p>
                <p className="text-sm text-red-700 mt-1">
                  You need {amount} USDT but only have {(Number(usdtBalance) / 1000000).toFixed(2)} USDT
                </p>
              </div>
            )}

            {!hasEnoughMATIC && maticBalance && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-sm font-medium text-red-900">
                  ❌ No MATIC for Gas Fees
                </p>
                <p className="text-sm text-red-700 mt-1">
                  You need MATIC to pay for transaction fees. Get some MATIC first.
                </p>
              </div>
            )}

            {simulateError && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <p className="text-sm font-medium text-yellow-900">
                  ⚠️ Transaction Simulation Failed
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {simulateError.message.includes('insufficient')
                    ? 'Check your USDT and MATIC balances'
                    : 'The transaction may fail. Proceed with caution.'}
                </p>
              </div>
            )}

            {(errorMessage || error) && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-sm font-medium text-red-900">
                  {errorMessage || translateError(error)}
                </p>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={isPending || isConfirming || !hasEnoughUSDT || !hasEnoughMATIC}
              className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isPending ? 'Confirming...' : 'Processing...'}
                </span>
              ) : (
                `Pay ${amount} USDT`
              )}
            </button>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">📝 Important Notes:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You need USDT on <strong>Polygon network</strong> (not Ethereum)</li>
                <li>• You need MATIC for gas fees (~$0.01)</li>
                <li>• Your wallet may show &quot;Unknown&quot; token - this is normal for USDT contract calls</li>
                <li>• Transaction will still send {amount} USDT correctly</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PayRequest() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading payment request...</p>
          </div>
        </div>
      </div>
    }>
      <PayRequestContent />
    </Suspense>
  );
}
