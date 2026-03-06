'use client';

interface ChainLogoProps {
  size?: number;
  className?: string;
}

/**
 * Always shows IOTA logo — IOTA is the sole user-facing chain.
 */
export function ChainLogo({ size = 20, className = 'object-contain' }: ChainLogoProps) {
  return <img src="/logos/iota-logo.svg" alt="IOTA" width={size} height={size} className={className} />;
}
