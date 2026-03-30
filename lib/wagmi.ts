import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'dummy-project-id-for-metamask';

if (typeof window !== 'undefined') {
  const originalError = window.console.error;
  window.console.error = (...args: any[]) => {
    const message = args[0]?.message || args[0] || '';
    const stringMessage = typeof message === 'string' ? message : JSON.stringify(message);
    if (
      stringMessage.includes('No matching key') ||
      stringMessage.includes('history:') ||
      args.some((arg) =>
        arg && typeof arg === 'object' && arg.context === 'client'
      )
    ) {
      return;
    }
    originalError.apply(window.console, args);
  };
}

export const config = getDefaultConfig({
  appName: 'Themis Payment',
  projectId,
  chains: [polygon],
  ssr: true,
  multiInjectedProviderDiscovery: false,
});
