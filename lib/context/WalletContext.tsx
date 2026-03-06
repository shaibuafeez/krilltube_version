'use client';

/**
 * Wallet Context — IOTA only
 * SuiClientProvider exists for Walrus SDK infrastructure but is not user-facing.
 */

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useCurrentAccount as useIotaAccount } from '@iota/dapp-kit';

export type SupportedChain = 'sui' | 'iota';

interface WalletState {
  chain: SupportedChain | null;
  address: string | null;
  isConnected: boolean;
}

interface WalletContextType extends WalletState {
  setActiveChain: (chain: SupportedChain) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletContextProvider({ children }: { children: ReactNode }) {
  const iotaAccount = useIotaAccount();

  const state: WalletState = iotaAccount?.address
    ? { chain: 'iota', address: iotaAccount.address, isConnected: true }
    : { chain: null, address: null, isConnected: false };

  // Keep setActiveChain for API compatibility but always resolve to IOTA
  const setActiveChain = useCallback((_chain: SupportedChain) => {
    // no-op — always IOTA
  }, []);

  const disconnect = useCallback(() => {
    // no-op — disconnection handled by IOTA dapp-kit
  }, []);

  const value: WalletContextType = {
    ...state,
    setActiveChain,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within WalletContextProvider');
  }
  return context;
}
