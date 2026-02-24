/**
 * Environment Variable Validation
 * Checks required env vars at app startup and logs missing ones clearly.
 * Import this in your root layout or providers to catch misconfigurations early.
 */

const REQUIRED_PUBLIC_VARS = [
  'NEXT_PUBLIC_SUI_TUNNEL_PACKAGE_ID',
  'NEXT_PUBLIC_SUI_DEMO_KRILL_COIN',
  'NEXT_PUBLIC_SUI_DEMO_KRILL_COIN_TREASURY_CAP_ID',
  'NEXT_PUBLIC_SUI_OPERATOR_ADDRESS',
  'NEXT_PUBLIC_SUI_OPERATOR_PUBLIC_KEY',
  'NEXT_PUBLIC_SUI_FEE_WALLET',
] as const;

const OPTIONAL_PUBLIC_VARS = [
  'NEXT_PUBLIC_SUI_RPC_URL',
  'NEXT_PUBLIC_WALRUS_NETWORK',
  'NEXT_PUBLIC_WALRUS_PUBLISHER',
  'NEXT_PUBLIC_WALRUS_AGGREGATOR',
  'NEXT_PUBLIC_WALRUS_EPOCHS',
  'NEXT_PUBLIC_SEAL_PACKAGE_ID',
  'NEXT_PUBLIC_LIVEKIT_URL',
  'NEXT_PUBLIC_UPLOAD_RELAY_ENABLED',
  'NEXT_PUBLIC_SUI_NETWORK',
  // IOTA vars are optional (IOTA support currently disabled)
  'NEXT_PUBLIC_IOTA_TUNNEL_PACKAGE_ID',
  'NEXT_PUBLIC_IOTA_DEMO_KRILL_COIN',
  'NEXT_PUBLIC_IOTA_DEMO_KRILL_COIN_TREASURY_CAP_ID',
  'NEXT_PUBLIC_IOTA_RPC_URL',
  'NEXT_PUBLIC_IOTA_FEE_WALLET',
  'NEXT_PUBLIC_IOTA_OPERATOR_ADDRESS',
  'NEXT_PUBLIC_IOTA_OPERATOR_PUBLIC_KEY',
] as const;

export function validateEnv(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_PUBLIC_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  for (const key of OPTIONAL_PUBLIC_VARS) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(
      `[KrillTube] Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n` +
      `Set these in your .env.local file or Vercel dashboard.`
    );
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `[KrillTube] Optional environment variables not set:\n${warnings.map(k => `  - ${k}`).join('\n')}`
    );
  }

  return { valid: missing.length === 0, missing, warnings };
}

// Run validation on import (client-side only, since NEXT_PUBLIC_ vars are available there)
if (typeof window !== 'undefined') {
  validateEnv();
}
