'use client';

/**
 * Wallet providers — IOTA is the sole user-facing chain.
 * SuiClientProvider + SuiWalletProvider are kept as infrastructure:
 *   - Walrus SDK needs SuiClientProvider for RPC
 *   - Several hooks (useSignAndExecuteTransaction, etc.) need SuiWalletProvider in the tree
 * autoConnect is disabled so no Sui wallet ever connects automatically.
 */

import { SuiClientProvider, WalletProvider as SuiWalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl as getSuiFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { IotaProvider } from '@/lib/providers/iota-provider';
import { WalletContextProvider } from '@/lib/context/WalletContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/lib/validateEnv';
import '@iota/dapp-kit/dist/index.css';

const queryClient = new QueryClient();

const suiNetworks = {
  mainnet: { url: getSuiFullnodeUrl('mainnet') },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NetworkProvider>
        <SuiClientProvider networks={suiNetworks} defaultNetwork="mainnet">
          <SuiWalletProvider autoConnect={false}>
            <IotaProvider>
              <WalletContextProvider>
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </WalletContextProvider>
            </IotaProvider>
          </SuiWalletProvider>
        </SuiClientProvider>
      </NetworkProvider>
    </QueryClientProvider>
  );
}
