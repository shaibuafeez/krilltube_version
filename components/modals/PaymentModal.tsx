'use client';

/**
 * Payment Modal
 * Shows payment options when user opens a video
 * Dynamically renders only the payment tokens configured by the creator
 */

import { useState } from 'react';

interface CreatorConfig {
  coinType: string;
  pricePerView: string;
  decimals: number;
  chain: string;
  iconUrl?: string | null;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayWithToken: (coinType: string) => void;
  onGetDemoTokens: () => void;
  creatorConfigs?: CreatorConfig[];
}

export function PaymentModal({
  isOpen,
  onClose,
  onPayWithToken,
  onGetDemoTokens,
  creatorConfigs = [],
}: PaymentModalProps) {
  if (!isOpen) return null;

  const formatPrice = (priceInSmallestUnit: string, decimals: number): string => {
    const price = parseFloat(priceInSmallestUnit) / Math.pow(10, decimals);
    return price.toFixed(2);
  };

  const getTokenInfo = (config: CreatorConfig) => {
    const { coinType, iconUrl } = config;

    if (coinType.includes('dkrill') || coinType.toLowerCase().includes('krill')) {
      return { symbol: '$dKRILL', icon: '/logos/krilll.png', isImage: true };
    }

    if (coinType.includes('0x2::iota::IOTA')) {
      return { symbol: '$IOTA', icon: '/logos/iota-logo.svg', isImage: true };
    }

    if (iconUrl) {
      return { symbol: coinType.split('::').pop() || 'TOKEN', icon: iconUrl, isImage: true };
    }

    return { symbol: coinType.split('::').pop() || 'TOKEN', icon: null, isImage: false };
  };

  return (
    <div className="absolute inset-0 bg-[#2C5F7E] z-30 flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-white mb-12">Pay in</h2>

      {creatorConfigs.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-8 mb-12 max-w-6xl mx-auto px-8">
          {creatorConfigs.map((config) => {
            const tokenInfo = getTokenInfo(config);
            const formattedPrice = formatPrice(config.pricePerView, config.decimals);

            return (
              <button
                key={config.coinType}
                onClick={() => onPayWithToken(config.coinType)}
                className="flex flex-col items-center gap-6 hover:scale-105 transition-transform"
              >
                <div className="w-32 h-32 bg-white rounded-full border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] flex items-center justify-center overflow-hidden">
                  {tokenInfo.isImage && tokenInfo.icon ? (
                    <img
                      src={tokenInfo.icon}
                      alt={tokenInfo.symbol}
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-[#0668A6]">
                      {tokenInfo.symbol.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-white">
                  {formattedPrice} {tokenInfo.symbol}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-white text-lg mb-12 text-center">
          <p className="mb-4">No payment options configured for this video.</p>
          <p className="text-white/60 text-sm">The creator hasn&apos;t set up payment tokens yet.</p>
        </div>
      )}

      {creatorConfigs.some(c => c.coinType.toLowerCase().includes('krill')) && (
        <button
          onClick={onGetDemoTokens}
          className="px-8 py-4 bg-white text-black text-lg font-bold rounded-[32px] border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] hover:shadow-[2px_2px_0_0_black] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          Get dKRILL for Demo for free!
        </button>
      )}
    </div>
  );
}
