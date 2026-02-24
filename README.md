# KrillTube

A decentralized video platform built on **Sui** and **Walrus** that gives creators true ownership of their content and earnings. Videos are encrypted client-side, stored on Walrus decentralized storage, and monetized through on-chain pay-per-view payments with transparent revenue splits.

## Features

- **Encrypted video streaming** -- HLS multi-rendition with per-video or subscription-based encryption
- **Pay-per-view & subscriptions** -- On-chain payments via Sui with creator-set pricing
- **Decentralized storage** -- All content stored on Walrus; no central server can take it down
- **Multi-content support** -- Videos, images, text/articles, and manga reader
- **Live streaming** -- LiveKit-powered broadcasts with real-time chat, donations, and co-host system
- **Creator profiles** -- On-chain identity with subscriber channels (SEAL encryption)
- **Transparent revenue** -- On-chain payment splits, verifiable by anyone

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19, TypeScript |
| Blockchain | Sui (mainnet) via `@mysten/dapp-kit` |
| Storage | Walrus decentralized storage (WASM SDK) |
| Encryption | Per-video DEK + SEAL (`@mysten/seal`) |
| Database | PostgreSQL via Prisma ORM |
| Streaming | LiveKit (`livekit-client` + `livekit-server-sdk`) |
| Transcoding | FFmpeg.wasm (client-side) |
| Styling | Tailwind CSS v4 |
| Testing | Vitest |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Sui wallet (for testing payments)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables and fill in your values
cp .env.example .env.local

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Key Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code
```

## Architecture

```
app/
  (app)/             # Authenticated routes (sidebar + header)
    watch/           # Video player with payment gate
    upload/video/    # Multi-step video upload with transcoding
    photos/          # Encrypted image galleries
    text/            # Encrypted articles
    manga/           # Comic reader
    profile/         # Creator profiles + subscriptions
  (public)/          # Landing page
  api/v1/            # REST API routes
    payment/         # Sui/IOTA payment processing
    videos/          # Video CRUD + streaming
    sessions/        # Playback session management
    subscriptions/   # Channel subscriptions
  live/              # Live streaming (broadcast + watch)

lib/
  crypto/            # Encryption primitives, key derivation
  kms/               # Envelope encryption (DEK wrapping)
  player/            # Encrypted HLS loader + hooks
  upload/            # Upload orchestrators per content type
  walrus*.ts         # Walrus SDK wrappers

components/          # React components
prisma/schema.prisma # Database schema (20+ models)
```

See [PROJECT.md](./PROJECT.md) for full architecture documentation and [PAYMENT_PROCESSING.md](./PAYMENT_PROCESSING.md) for the payment flow.

## Deployment

- **Mainnet**: Deployed on Vercel with Sui mainnet + Walrus mainnet storage
- **Tunnel Package (Sui)**: `0x7bbb50d858c28d41c5b269de3ac03d5d1c6548400078b7cbee6c3c7869b2ed53`
- **WAL Token**: `0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL`

## License

All rights reserved.
