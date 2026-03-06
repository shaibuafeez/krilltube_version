/**
 * useCurrentWalletMultiChain — IOTA only
 * Returns the IOTA wallet. suiWallet is always null (kept for API compat).
 */

'use client';

import { useCurrentWallet as useIotaCurrentWallet } from '@iota/dapp-kit';
import { useWalletContext } from '@/lib/context/WalletContext';

export type WalletNetwork = 'sui' | 'iota' | null;

export interface MultiChainWalletState {
  network: WalletNetwork;
  suiWallet: null;
  iotaWallet: ReturnType<typeof useIotaCurrentWallet>['currentWallet'] | null;
}

export function useCurrentWalletMultiChain(): MultiChainWalletState {
  const { chain } = useWalletContext();
  const { currentWallet: iotaWallet } = useIotaCurrentWallet();

  return {
    network: chain,
    suiWallet: null,
    iotaWallet: chain === 'iota' ? iotaWallet : null,
  };
}
