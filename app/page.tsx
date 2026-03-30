'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      <nav className="p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Themis</h1>
        <ConnectButton />
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Global Payments Made Simple
          </h2>
          <p className="text-xl text-primary-50 mb-12">
            Send and receive USDT instantly across borders with no fees.
            Powered by blockchain technology.
          </p>

          {isConnected ? (
            <div className="flex gap-4 justify-center">
              <Link
                href="/request/create"
                className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg"
              >
                Request Payment
              </Link>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-white mb-4">Connect your wallet to get started</p>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-colors w-full"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8 mt-20 text-left">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant</h3>
              <p className="text-primary-100">
                Payments settle in seconds, not days
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold text-white mb-2">Global</h3>
              <p className="text-primary-100">
                Send money anywhere in the world
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure</h3>
              <p className="text-primary-100">
                Your funds, your control, always
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
