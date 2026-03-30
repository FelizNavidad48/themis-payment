'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';
import { config } from '@/lib/wagmi';
import { polygon } from 'wagmi/chains';

import '@rainbow-me/rainbowkit/styles.css';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const queryClient = getQueryClient();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} initialChain={polygon}>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          {mounted ? (
            children
          ) : (
            <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-6">
              <div className="w-full max-w-md space-y-4">
                <div className="h-16 bg-white/10 rounded-xl animate-shimmer"></div>
                <div className="h-16 bg-white/10 rounded-xl animate-shimmer" style={{ animationDelay: '0.1s' }}></div>
                <div className="h-16 bg-white/10 rounded-xl animate-shimmer" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
