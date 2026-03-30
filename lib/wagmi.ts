import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'dummy-project-id-for-metamask';

export const config = getDefaultConfig({
  appName: 'Themis Payment',
  projectId,
  chains: [polygon],
  ssr: true,
  multiInjectedProviderDiscovery: false,
});
