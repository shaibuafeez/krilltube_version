<!-- cSpell:words Moveathon tokenomics micropayment micropayments deplatforming Bittube LBRY Odysee Udemy -->

# KrillTube - Judge Feedback & Improvement Plan

**Event**: Moveathon (Europe Edition) 2025
**Team**: GiveRep (3MateLabs)
**Date**: February 2025

---

## Judge Feedback Summary

| # | Feedback Point | Category |
|---|---------------|----------|
| 1 | Demo and pitch were very well presented and thorough | Positive |
| 2 | Skepticism about initial Krill token distribution mechanism | Tokenomics |
| 3 | Doubts about micropayment-for-video model competing with free/subscription platforms | Business Model |
| 4 | dApp not working due to a "not found package" error | Technical Bug |
| 5 | Suggestion to allow donations/tipping, not only pay-per-view | Feature Request |
| 6 | Missing README in the repository | Documentation |

---

## Deployment Status

**Mainnet**: Yes, KrillTube is deployed to production on **Sui mainnet** with Walrus mainnet storage.

- **WAL Token (Sui Mainnet)**: `0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL`
- **Walrus Aggregator (Mainnet)**: `https://aggregator.mainnet.walrus.mirai.cloud`
- **Sui RPC (Mainnet)**: `https://fullnode.mainnet.sui.io:443`
- **Sui Tunnel Package ID (Mainnet)**: `0x7bbb50d858c28d41c5b269de3ac03d5d1c6548400078b7cbee6c3c7869b2ed53`
- **IOTA Tunnel Package ID**: `0x414cdef54dcf8b37cf3201fa519b53aa555bb876d161679aea91923cff9977fc`
- **IOTA Support**: Currently restricted to testnet only (Walrus mainnet integration for IOTA pending).

The application is hosted on **Vercel** with auto-deployments from the main branch.

---

## Improvement Plan

### 1. Fix "Not Found Package" Bug (P0 - Critical)

**Judge said**: "Didn't work for me to actually interact with the dApp because of a not found package."

**Root Cause Analysis**: Code audit reveals **7 locations** where environment variables are accessed with non-null assertions (`!`) and no validation, which will crash at runtime if the variable is missing:

| Variable | File | Line | Risk |
|----------|------|------|------|
| `NEXT_PUBLIC_IOTA_TUNNEL_PACKAGE_ID` | `app/api/v1/payment/process-iota/route.ts` | 57 | Crash on any IOTA payment attempt |
| `NEXT_PUBLIC_IOTA_TUNNEL_PACKAGE_ID` | `lib/utils/processPayment.ts` | 117 | Crash when building IOTA payment tx |
| `NEXT_PUBLIC_SUI_TUNNEL_PACKAGE_ID` | `lib/utils/processPayment.ts` | 47 | Crash when building Sui payment tx |
| `NEXT_PUBLIC_SUI_DEMO_KRILL_COIN` | `components/CustomVideoPlayer.tsx` | 183 | Crash when showing payment modal |
| `NEXT_PUBLIC_IOTA_DEMO_KRILL_COIN` | `components/CustomVideoPlayer.tsx` | 184 | Crash when showing payment modal |
| `NEXT_PUBLIC_SUI_DEMO_KRILL_COIN_TREASURY_CAP_ID` | `lib/utils/mintDemoKrill.ts` | 28 | Crash on demo token mint |
| `NEXT_PUBLIC_IOTA_DEMO_KRILL_COIN_TREASURY_CAP_ID` | `lib/utils/mintDemoKrill.ts` | 29 | Crash on demo token mint |

The most likely scenario: the judge connected a wallet, tried to watch a video or interact with the payment modal, and the app crashed because a `NEXT_PUBLIC_*` env var was missing or misconfigured on the deployed Vercel instance. The non-null assertion (`!`) produces an opaque runtime error instead of a useful message.

**Action Items**:
- [ ] Audit all environment variables on Vercel production -- confirm every `NEXT_PUBLIC_*` variable is set
- [ ] Replace all non-null assertions (`!`) on env vars with explicit checks and user-friendly error messages in the 7 files listed above
- [ ] Add a React error boundary around the payment modal and video player that catches env-related crashes and shows "Configuration error -- please try again later" instead of a white screen
- [ ] Create a startup validation module (`lib/validateEnv.ts`) that checks all required env vars on app load and logs missing ones
- [ ] Add a health-check endpoint (`/api/health`) that verifies env vars and contract connectivity
- [ ] Test the complete user flow (connect wallet -> browse -> pay -> watch) on a clean browser in incognito mode before any demo or submission

---

### 2. Add README to Repository (P0 - Quick Win)

**Judge said**: "Please add a README to the repo next time. It's the first thing I check out in a repo."

**Current State**: No `README.md` exists in the repository root. The only file in `/docs` is an empty `TECH_STACK.md`. Detailed documentation exists in `PROJECT.md`, `PAYMENT_PROCESSING.md`, and several `IOTA_*.md` files, but none of these are the standard entry point a reviewer checks first.

**Action Items**:
- [ ] Create `README.md` in the repo root with:
  - One-paragraph project description (what KrillTube is and why it exists)
  - Live demo link
  - Screenshot or GIF of the main UI
  - Tech stack summary (Next.js 16, Sui/IOTA, Walrus, Prisma, AWS KMS, Tailwind)
  - Quick start instructions (`npm install`, env setup, `npx prisma generate`, `npm run dev`)
  - Link to `PROJECT.md` for full architecture docs
  - Link to `PAYMENT_PROCESSING.md` for payment flow details
  - Deployed contract / package references
- [ ] Create `.env.example` listing all required variables with placeholder values (no secrets)
- [ ] Populate `docs/TECH_STACK.md` (currently empty) or remove it

---

### 3. Implement Donation / Tipping Feature (P1 - Feature)

**Judge said**: "Would also be nice to not just have to pay for videos but allow people to donate with micropayments."

**Current State**: Only pay-per-view exists. The Tunnel contract supports arbitrary payment amounts and three-way splits (creator/platform/referrer), but there is no UI or flow for voluntary donations. The subscriptions page exists as UI but has no backend.

**Proposed Implementation**:
- [ ] Add a "Tip Creator" button below the video player on the watch page
  - Use a simple direct transfer (no Tunnel contract needed for tips -- avoids platform/referrer fee split on voluntary donations)
  - Let users pick an amount (preset buttons: 1, 5, 10 KRILL + custom)
  - Support native tokens (IOTA, SUI) and dKRILL
- [ ] Allow creators to mark videos as **free** during upload
  - Free videos skip the payment gate entirely
  - Still show the tip button so viewers can voluntarily support
  - Add a `isFree` boolean field to the `Video` or `CreatorConfig` model
- [ ] Add tip history to the creator's video management page
  - Track tips in a new `VideoTip` database table (payer, amount, coinType, txDigest)
- [ ] Consider a "Super Chat" feature for comments
  - Attach a payment to a comment to make it highlighted/pinned

---

### 4. Clarify Krill Token Distribution Model (P2 - Tokenomics)

**Judge said**: "I am not so sure on the mechanism of distributing Krill initially."

**Current State**: `dKRILL` is a demo/test token. Users can mint 1000 dKRILL for free via `mintDemoKrill.ts` using a treasury cap. There is no documented plan for how the real KRILL token would be distributed or what gives it value beyond being a payment medium.

**Action Items**:
- [ ] Design and document a tokenomics model addressing:
  - **Initial distribution**: How do users get KRILL to start using the platform? (Airdrop to early adopters? Faucet with daily limits? Earn by watching?)
  - **Value accrual**: Why would KRILL hold value? (Required for premium content? Staking for creator verification? Governance rights?)
  - **Supply mechanics**: Fixed supply vs inflationary? Burn mechanism on platform fees?
  - **Bootstrap problem**: New platform has no viewers, so creators earn nothing, so no creators join. How do we break this cycle?
- [ ] Concrete distribution mechanisms to consider:
  - **Watch-to-earn**: Small KRILL rewards for viewing free content (funded by platform treasury)
  - **Creator onboarding grants**: Initial KRILL allocation for first 100 creators who upload content
  - **Referral program**: KRILL rewards for inviting new users (leverages existing 30% referrer fee split in Tunnel contract)
  - **Faucet**: Daily claimable KRILL with anti-sybil measures (wallet age, activity)
- [ ] Add a tokenomics section to README and pitch deck
- [ ] Consider whether KRILL should exist at all vs just using native chain tokens (IOTA/SUI) -- simpler model, removes the distribution question entirely

---

### 5. Address Business Model Viability Concerns (P1 - Strategy)

**Judge said**: "Somewhat doubtful on the validity of micropayments for videos... very hard time competing with free video platforms... I have seen many attempts of creating a platform such as Krill."

**This is the most critical feedback.** The judge is right -- pay-per-view video platforms have a poor track record. Past failures include Bittube, LBRY/Odysee (pivoted away from pay-per-view), DTube, and others. The common failure mode is: no viewers because content costs money -> no creators because there are no viewers.

**Our differentiation strategy must address this directly**:

- [ ] **Ship a hybrid model** -- not everything behind a paywall:
  - **Free videos** with optional tipping (most content)
  - **Premium/exclusive content** with pay-per-view (creator's choice)
  - **Creator subscriptions** for recurring supporter access (UI exists, build the backend)
  - This matches what works: YouTube has free + Premium + Super Chat + memberships

- [ ] **Target niches where pay-per-content already works**:
  - Educational content (Udemy model -- pay per course, not per video)
  - Behind-the-scenes / exclusive creator content (Patreon model, but on-chain)
  - Web3-native communities who already hold tokens and understand wallets
  - Regions with high creator payout friction (crypto payments bypass traditional banking)

- [ ] **Lead with what free platforms cannot offer**:
  - **No deplatforming risk** -- content on Walrus decentralized storage, not a company server
  - **Transparent earnings** -- on-chain payment splits, verifiable by anyone
  - **Creator-set pricing** -- no algorithm deciding who gets promoted
  - **Client-side encryption** -- platform itself cannot access content without payment
  - **Direct creator-viewer relationship** -- no intermediary can change the terms

- [ ] **Reframe the pitch**: We are not "YouTube but you pay per video." We are "the creator monetization layer for Web3" -- a protocol for video payments that gives creators tools they cannot get anywhere else.

---

## Priority Matrix

| Priority | Item | Impact | Effort |
|----------|------|--------|--------|
| P0 | Fix non-null assertion crashes (7 locations) | High | Low |
| P0 | Add README.md + .env.example | High | Low |
| P1 | Hybrid model: free videos + tipping | High | Medium |
| P1 | Reframe pitch around creator ownership | High | Low |
| P1 | Implement donation/tipping UI | High | Medium |
| P2 | Tokenomics documentation | Medium | Low |
| P2 | Subscription backend | Medium | High |
| P3 | Watch-to-earn mechanics | Medium | High |

---

## Technical Debt to Address

1. **Unsafe env var access**: 7 locations use `!` non-null assertion on `process.env` values. Replace with validated access and graceful error handling.
2. **Sui payment backend**: Not implemented (`process-sui/route.ts` returns "not implemented"). Only IOTA has secure server-side processing. Frontend-only payment on Sui is vulnerable to client-side manipulation.
3. **IOTA mainnet Walrus**: Currently forced to testnet via `UploadNetworkSwitcher.tsx`. Full mainnet support for IOTA users is blocked on Walrus availability.
4. **Empty docs**: `docs/TECH_STACK.md` is empty (0 bytes). Either populate or remove.
5. **Error boundaries**: No React error boundaries around critical flows (payment modal, video player). Unhandled errors produce white screens.
6. **Testing**: No integration tests for the payment flow. Add tests that verify the full connect -> pay -> watch path works with mocked chain responses.

---

## Conclusion

The judge's feedback points to three categories of work:

1. **Reliability (P0)**: The dApp must work when someone tries it. The "not found package" crash is traced to 7 unsafe environment variable accesses. Fix these, add error boundaries, and test the full flow before every demo.

2. **Documentation (P0)**: A missing README signals that the project isn't ready for external review. This is a quick win that changes first impressions.

3. **Business model evolution (P1)**: Pure pay-per-view is a tough sell. Shipping free videos with tipping, reframing the pitch around creator ownership and censorship resistance, and targeting niches where pay-per-content already works (education, exclusive content, Web3-native communities) will address the viability concern.

The technical foundation is strong -- client-side encryption, multi-chain support, on-chain payment splits -- but the product needs to meet users where they are: most content free, with clear value for the content worth paying for.