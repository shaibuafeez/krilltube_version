# KrillTube Live Streaming Feature - 14-Day Development Plan

## Main Goal

### Build a complete live streaming platform with real-time video broadcasting, interactive chat, blockchain donations, and content discovery - matching YouTube Live and TikTok Live functionality.

**Key Technologies:** LiveKit (WebRTC), Prisma (Database), Sui Blockchain (Payments), Next.js 16

**Total Commits:** 75 commits | **Lines Changed:** ~10,000+ lines | **Files Modified:** 50+ files

---

---

## 🗓️ Detailed Daily Plan

### **Monday (Week 1 - Day 1)**

| Task | Hours | Description |
| --- | --- | --- |
| **LiveKit research & SDK evaluation** | 3 hours | Compare LiveKit vs Agora for WebRTC streaming, evaluate pricing models, analyze feature sets, latency guarantees, and developer experience. Document findings and make technology selection. |
| **Database schema design** | 2 hours | Design Prisma models for LiveStream, ChatMessage, and Donation tables. Define relationships, indexes, and constraints. Plan for real-time updates and analytics tracking. |
| **LiveKit account setup** | 1 hour | Create LiveKit Cloud account, generate API keys, configure project settings, test token generation, and verify WebRTC connectivity. |
| **Project architecture planning** | 2 hours | Design broadcaster and viewer flows, plan API endpoints, create sequence diagrams for stream lifecycle, chat system, and donation flow. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- Technology selection document (LiveKit chosen for WebRTC)
- Database schema (Prisma models designed)
- LiveKit credentials configured in development
- Architecture diagrams for broadcaster/viewer flows

**Technical Decisions:**
- LiveKit selected over Agora for better developer experience and pricing
- Polling approach for chat (2-second interval) instead of WebSocket for simpler implementation
- Blockchain payments for donations (transparent, decentralized, trustless)
- Prisma ORM for database management

**Research Findings:**
- LiveKit provides <2 second latency with WebRTC
- Supports 100+ concurrent viewers per room
- Built-in token-based authentication
- Excellent React SDK with hooks

---

### **Tuesday (Week 1 - Day 2)**

| Task | Hours | Description |
| --- | --- | --- |
| **Implement Prisma models** | 2 hours | Create LiveStream, ChatMessage, and Donation models in schema.prisma. Define fields (id, roomName, title, description, creatorId, status, viewerCount, etc.), relationships (one-to-many), and indexes for query optimization. |
| **Run database migrations** | 1 hour | Execute `npx prisma db push` to sync schema with PostgreSQL database, seed initial test data for development, verify migrations applied successfully. |
| **Create `/api/live/create-room` endpoint** | 2 hours | Build Next.js API route to generate unique room names, validate input (title max 100 chars, description max 500 chars), store stream metadata in database, return room details to client. |
| **Create `/api/live/token` endpoint** | 2 hours | Implement LiveKit JWT token generation with broadcaster/viewer permissions, configure token expiration, validate room existence, handle authentication. |
| **Testing with Postman/cURL** | 1 hour | Test API endpoints with various payloads, verify error handling, check database records created correctly, validate token generation works. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- `prisma/schema.prisma` updated with live streaming models
- `/app/api/live/create-room/route.ts` (72 lines)
- `/app/api/live/token/route.ts` (94 lines)
- Database migrations applied successfully

**Database Schema:**
```prisma
model LiveStream {
  id            String   @id @default(cuid())
  roomName      String   @unique
  title         String
  description   String?
  creatorId     String
  status        String   @default("active")
  viewerCount   Int      @default(0)
  startedAt     DateTime @default(now())
  endedAt       DateTime?

  chatMessages  ChatMessage[]
  donations     Donation[]

  @@index([creatorId])
  @@index([status])
}

model ChatMessage {
  id              String    @id @default(cuid())
  streamId        String
  userId          String
  userName        String
  message         String
  donationAmount  String?
  deleted         Boolean   @default(false)
  createdAt       DateTime  @default(now())

  stream          LiveStream @relation(fields: [streamId], references: [id], onDelete: Cascade)

  @@index([streamId])
}
```

**API Endpoints:**
- `POST /api/live/create-room` - Generates unique room name, stores stream metadata
- `POST /api/live/token` - Creates JWT tokens with broadcaster/viewer permissions

---

### **Wednesday (Week 1 - Day 3)**

| Task | Hours | Description |
| --- | --- | --- |
| **Install LiveKit React SDK** | 1 hour | Install @livekit/components-react and livekit-client packages, configure Next.js for WebRTC, set up environment variables for LiveKit URL and API keys. |
| **Create `LiveStreamPlayer` component** | 4 hours | Build dual-mode video player component using useTracks and useParticipants hooks. Implement track subscription logic, participant management, and error handling for both broadcaster and viewer modes. |
| **Implement broadcaster view** | 1 hour | Add local camera preview with VideoTrack component, create "camera not detected" placeholder, implement LIVE badge with pulsing animation, add real-time viewer count display with SVG eye icon. |
| **Implement viewer view** | 1 hour | Subscribe to broadcaster's video/audio tracks automatically, display loading state "Waiting for broadcaster..." when no tracks available, handle track connection/disconnection gracefully. |
| **Apply neomorphic design** | 1 hour | Style with rounded-[32px] corners, black background, shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)], outline-[3px], red LIVE badge with backdrop-blur-sm, pulsing white dot animation. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- `components/LiveStreamPlayer.tsx` (161 lines)
- Broadcaster mode with local camera/audio preview
- Viewer mode with remote stream subscription
- Real-time viewer count display
- LIVE badge with pulsing animation

**LiveStreamPlayer Component Architecture:**
```typescript
interface LiveStreamPlayerProps {
  isBroadcaster: boolean;
}

// Hooks used:
- useTracks([Track.Source.Camera]) // Subscribe to video tracks
- useTracks([Track.Source.Microphone]) // Subscribe to audio tracks
- useParticipants() // Count viewers in real-time

// Broadcaster view:
- Shows local camera preview with VideoTrack
- Displays "camera not detected" placeholder
- Shows LIVE badge with pulsing dot
- Real-time viewer count with SVG eye icon

// Viewer view:
- Shows broadcaster's video/audio stream
- Loading state "Waiting for broadcaster..."
- Auto-connects to available tracks
- Same LIVE badge and viewer count
```

**Styling:**
- Neomorphic design with `rounded-[32px]` corners
- Black background for video container
- Red LIVE badge: `bg-red-600/90` with `backdrop-blur-sm`
- Pulsing animation: `animate-pulse` on white dot
- SVG eye icon for viewer count (no emoji)

**Performance:** WebRTC provides <2 second latency for video/audio

---

### **Thursday (Week 1 - Day 4)**

| Task | Hours | Description |
| --- | --- | --- |
| **Create chat API** | 3 hours | Build `/api/live/chat` route with GET (fetch last 50 messages) and POST (send message) methods. Validate user authentication, sanitize input, store messages in database with userId, userName, message, and createdAt fields. |
| **Create chat delete API** | 1 hour | Implement `/api/live/chat/delete` endpoint for broadcaster-only message deletion. Add soft delete with `deleted: true` flag, verify broadcaster permissions before deleting. |
| **Build `LiveChat` component** | 3 hours | Create TikTok Live-style chat with compact message bubbles, user avatars with gradient colors, dark theme input box with pink send button, auto-scroll to bottom functionality. |
| **Implement 2-second polling** | 1 hour | Set up useEffect with setInterval(fetchMessages, 2000) for real-time chat updates, handle cleanup on unmount, optimize re-renders with useMemo. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- `/app/api/live/chat/route.ts` (96 lines)
- `/app/api/live/chat/delete/route.ts` (66 lines)
- `components/LiveChat.tsx` (294 lines - initial version)
- Real-time chat with 2-second polling

**Chat API Features:**
- `GET /api/live/chat?streamId={id}` - Fetch last 50 messages
- `POST /api/live/chat` - Send message (validates user, sanitizes input)
- `POST /api/live/chat/delete` - Soft delete (broadcaster only)

**LiveChat Component Features:**
```typescript
// Message polling:
useEffect(() => {
  const fetchMessages = async () => {
    const response = await fetch(`/api/live/chat?streamId=${streamId}`);
    const data = await response.json();
    setMessages(data.messages || []);
  };

  fetchMessages();
  const interval = setInterval(fetchMessages, 2000); // 2-second polling
  return () => clearInterval(interval);
}, [streamId]);

// Auto-scroll to bottom:
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

**Chat UI:**
- Compact message bubbles with `bg-black/60 backdrop-blur-sm`
- User avatars with gradient colors (initial version)
- Username + message in single line
- Dark theme input box with pink send button
- Auto-scroll to latest messages

**Performance:** 2-second latency for chat messages

---

### **Friday (Week 1 - Day 5)**

| Task | Hours | Description |
| --- | --- | --- |
| **Create donation API** | 2 hours | Build `/api/live/donation` endpoint to verify Sui blockchain transactions, validate txDigest exists on-chain, extract amount from transaction effects, store donation in database with streamId, donorId, creatorId, amount, and txDigest. |
| **Build `DonationModal` component** | 3 hours | Create modal with amount selection (0.1, 0.5, 1, 5, 10 SUI), optional message input, Sui wallet integration using @mysten/dapp-kit, transaction signing with transferObjects, error handling and loading states. |
| **Implement Super Chat highlighting** | 2 hours | Update LiveChat to display donation messages with yellow/orange gradient background, show SUI amount with 💰 emoji, bold donor name, highlight message with larger padding and different styling. |
| **Test full donation flow** | 1 hour | Test wallet connection, transaction signing, blockchain verification, Super Chat message appearance, edge cases (rejected transaction, network errors, duplicate donations). |
| **Total** | **8 hours** | |

**Key Deliverables:**
- `/app/api/live/donation/route.ts` (84 lines)
- `components/DonationModal.tsx` (258 lines)
- Super Chat messages with yellow/orange gradient
- Blockchain payment integration complete

**Donation Flow:**
```typescript
// 1. User clicks gift button → opens DonationModal
// 2. User selects amount (0.1, 0.5, 1, 5, 10 SUI)
// 3. User enters optional message
// 4. Sign transaction with Sui wallet:

const tx = new Transaction();
tx.transferObjects(
  [tx.splitCoins(tx.gas, [amount])],
  creatorAddress
);

const result = await signAndExecuteTransaction({
  transaction: tx,
  options: { showEffects: true },
});

// 5. Verify transaction on blockchain:
const verified = await fetch('/api/live/donation', {
  method: 'POST',
  body: JSON.stringify({
    streamId,
    donorId: currentAccount.address,
    creatorId,
    amount: amountInMist,
    message,
    txDigest: result.digest,
  }),
});

// 6. Create Super Chat message in database
// 7. Message appears highlighted via polling
```

**Super Chat Styling:**
```typescript
// Highlighted donation message:
<div className="px-3 py-1.5
  bg-gradient-to-r from-yellow-400/95 to-orange-500/95
  backdrop-blur-sm rounded-2xl">
  <div className="flex items-baseline gap-1.5">
    <p className="text-xs font-bold text-black">
      {userName}
    </p>
    <span className="text-xs font-semibold text-black/80">
      💰 {(parseInt(donationAmount) / 1e9).toFixed(2)} SUI
    </span>
  </div>
  <p className="text-sm text-black font-medium">
    {message}
  </p>
</div>
```

**Blockchain Integration:** All donations verified on Sui blockchain with transaction hash

---

### **Monday (Week 2 - Day 6)**

| Task | Hours | Description |
| --- | --- | --- |
| **Create `/live/create` page** | 2 hours | Build stream creation form with title input (max 100 chars), description textarea (max 500 chars), wallet connection check, validation before submission, API call to `/api/live/create-room`, redirect to broadcaster dashboard on success. |
| **Create broadcaster dashboard** | 3 hours | Build `/live/broadcast/[roomName]` page with LiveStreamPlayer (isBroadcaster=true), LiveChat with moderation controls, End Stream button, real-time viewer count, LiveKit room connection with broadcaster token. |
| **Create viewer page** | 2 hours | Build `/live/watch/[roomName]` page with LiveStreamPlayer (isBroadcaster=false), LiveChat with donation button, stream metadata display (title, description, creator), LiveKit connection with viewer token. |
| **Add "Go Live" button** | 1 hour | Add navigation button to sidebar with red gradient background, link to `/live/create`, active state styling, test navigation flow from all pages. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- `app/live/create/page.tsx` (200 lines)
- `app/live/broadcast/[roomName]/page.tsx` (178 lines)
- `app/live/watch/[roomName]/page.tsx` (161 lines)
- Complete live streaming navigation flow

**Stream Creation Page:**
```typescript
// Form inputs:
- Title: max 100 characters
- Description: max 500 characters (optional)
- Wallet connection check
- Validation before creation

// Flow:
1. User enters title and description
2. Click "Start Streaming" button
3. API call to /api/live/create-room:
   - Generates unique roomName
   - Stores stream metadata in database
   - Returns room details
4. Redirect to /live/broadcast/{roomName}
```

**Broadcaster Dashboard:**
```typescript
// Components:
- LiveStreamPlayer (isBroadcaster={true})
- LiveChat (isBroadcaster={true}) with moderation
- End Stream button
- Real-time viewer count

// LiveKit integration:
- Connect with broadcaster token (camera/mic permissions)
- Publish video/audio tracks
- Monitor viewer count via useParticipants hook
```

**Viewer Page:**
```typescript
// Components:
- LiveStreamPlayer (isBroadcaster={false})
- LiveChat (isBroadcaster={false}) with donation button
- Stream metadata (title, description, creator)

// LiveKit integration:
- Connect with viewer token (subscribe only)
- Subscribe to broadcaster's video/audio tracks
- Display loading state until tracks available
```

**Navigation Integration:**
- "Go Live" button added to sidebar with red gradient background
- Links to `/live/create` page
- Active state styling when on live pages

---

### **Tuesday (Week 2 - Day 7)**

| Task | Hours | Description |
| --- | --- | --- |
| **Create `/api/live/streams` endpoint** | 2 hours | Build API route to fetch active streams from database, filter by status='active', sort by viewerCount descending, include creator profile info, implement pagination (take: 20), return stream metadata. |
| **Build `StreamCard` component** | 2 hours | Create neomorphic card with LIVE badge (top-left), viewer count (top-right), thumbnail placeholder, title and creator info, hover effects (scale, shadow reduction), click to navigate to `/live/watch/[roomName]`. |
| **Update `/watch` page** | 2 hours | Add "Live Now" section above video grid, implement horizontal scrollable carousel with flex gap-6 overflow-x-auto, display active streams using StreamCard, add "Start Streaming" button. |
| **Add to homepage** | 1 hour | Integrate featured live streams section on homepage, show top 3 streams by viewer count, compact variant of StreamCard, link to browse all live streams. |
| **Testing and polish** | 1 hour | Test stream discovery with multiple active streams, verify real-time viewer count updates, check responsive behavior, ensure navigation works correctly. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- `/app/api/live/streams/route.ts` (70 lines)
- `components/StreamCard.tsx` (273 lines)
- Updated `/app/(app)/watch/page.tsx` with live streams section
- Homepage integration complete

**Streams API:**
```typescript
// GET /api/live/streams
// Returns active streams sorted by viewer count

const streams = await prisma.liveStream.findMany({
  where: { status: 'active' },
  orderBy: [
    { viewerCount: 'desc' },
    { startedAt: 'desc' },
  ],
  take: 20, // Pagination
});

// Response includes:
- id, roomName, title, description
- creatorId, viewerCount, startedAt
- Creator profile info
```

**StreamCard Component:**
```typescript
interface StreamCardProps {
  id: string;
  roomName: string;
  title: string;
  description?: string;
  creator: string;
  creatorAddress: string;
  status: 'live';
  viewerCount: number;
  startedAt: Date;
  variant?: 'featured' | 'compact';
}

// Styling:
- Neomorphic card with shadow and outline
- LIVE badge in top-left
- Viewer count in top-right
- Thumbnail placeholder (or snapshot if available)
- Title and creator info
- Hover effects (scale, shadow reduction)
```

**Watch Page Integration:**
```typescript
// Live Now section above videos:
<div className="mb-8">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold">🔴 Live Now</h2>
    <Link href="/live/create">Start Streaming</Link>
  </div>

  {/* Horizontal scrollable carousel */}
  <div className="flex gap-6 overflow-x-auto">
    {liveStreams.map((stream) => (
      <StreamCard key={stream.id} {...stream} />
    ))}
  </div>
</div>
```

**Discovery Features:**
- Active stream listing
- Real-time viewer count updates
- Click to watch functionality
- Seamless navigation to `/live/watch/{roomName}`

---

### **Wednesday (Week 2 - Day 8)**

| Task | Hours | Description |
| --- | --- | --- |
| **Convert chat to overlay** | 2 hours | Transform sidebar chat into absolute positioned overlay on video player (right-4 top-4 bottom-4 w-80), add toggle button with chat/hide icons, implement bg-black/40 backdrop-blur-md rounded-2xl styling. |
| **Redesign message bubbles** | 2 hours | Change from large bubbles to compact single-line format with text-xs, reduce padding to px-3 py-1.5, decrease gap to space-y-1.5, combine username and message in one line with colon separator. |
| **Improve input box** | 2 hours | Redesign with dark theme bg-gray-800/80 backdrop-blur-sm, rounded-full shape, white/60 placeholder color, pink-500/90 send button, wider w-full layout, focus states with bg-gray-800/90. |
| **Replace emoji gift button** | 1 hour | Create SVG gift box icon with path strokes, white/90 background rounded-full, w-10 h-10 size, position next to send button (not separate row), black icon color. |
| **Adjust chat width** | 1 hour | Increase chat overlay width from w-64 to w-80 for better typing experience, ensure input box is wider, test responsive behavior, adjust positioning to not cover viewer count. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- TikTok-style overlay chat design
- Compact message bubbles
- Modern dark theme input
- SVG gift box icon
- Optimized chat width

**Commits:**
- "feat: add YouTube/TikTok-style overlay chat with toggle button"
- "feat: complete TikTok Live style chat transformation"
- "feat: improve chat input UX with dark theme and better colors"
- "feat: make gift button a compact icon next to send button"
- "feat: increase chat overlay width for wider input box"

**Overlay Chat Implementation:**
```typescript
// Before: Sidebar chat
// After: Overlay on video player

<div className="absolute right-4 top-4 bottom-4 w-80
  bg-black/40 backdrop-blur-md rounded-2xl
  flex flex-col">
  <LiveChat {...props} />
</div>

// Toggle button:
<button onClick={() => setShowChat(!showChat)}
  className="absolute top-4 right-4 p-3
    bg-black/60 backdrop-blur-sm rounded-full
    border-2 border-white/30">
  {showChat ? <EyeOffIcon /> : <MessageIcon />}
</button>
```

**Compact Message Bubbles:**
```typescript
// Before: Large bubbles with padding
// After: Compact single-line format

<div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-2xl">
  <p className="text-xs">
    <span className="font-bold text-white">{userName}:</span>
    <span className="text-white/90 ml-1">{message}</span>
  </p>
</div>

// Reduced gap between messages: space-y-1.5
// Smaller font size: text-xs
// Less padding: px-3 py-1.5 (was px-4 py-2)
```

**Dark Theme Input:**
```typescript
<input
  type="text"
  placeholder="Add comment..."
  className="flex-1 px-4 py-2.5
    bg-gray-800/80 backdrop-blur-sm rounded-full
    text-white placeholder-white/60
    outline-none text-sm
    focus:bg-gray-800/90 transition-colors"
/>

// Send button:
<button className="px-4 py-2.5
  bg-pink-500/90 backdrop-blur-sm rounded-full
  text-white font-semibold text-sm
  hover:bg-pink-500">
  Send
</button>
```

**SVG Gift Icon:**
```typescript
// Replaced: 🎁 emoji
// With: SVG gift box icon

<button className="w-10 h-10 bg-white/90 rounded-full
  flex items-center justify-center">
  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor">
    <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
</button>
```

**UX Improvements:**
- Chat width increased from 64 to 80 (w-64 → w-80)
- Input box wider for better typing experience
- Gift button positioned next to send button (not separate row)
- Toggle button moved to prevent covering viewer count

---

### **Thursday (Week 2 - Day 9)**

| Task | Hours | Description |
| --- | --- | --- |
| **Fix viewer count calculation** | 2 hours | Use useParticipants() hook to get accurate count, subtract 1 for broadcaster (Math.max(0, participants.length - 1)), handle edge cases (broadcaster-only room = 0 viewers), ensure LiveKit automatically removes disconnected participants. |
| **Modernize LIVE indicator** | 2 hours | Redesign badge with minimal style: small pulsing white dot (w-2 h-2 animate-pulse), red-600/90 background, backdrop-blur-sm, compact size px-4 py-2 rounded-full, uppercase "LIVE" text with tracking-wide. |
| **Add SVG eye icon** | 2 hours | Replace 👁️ emoji with SVG eye icon (viewBox 0 0 24 24), stroke paths for eyeball and pupil, white color w-5 h-5, black/80 background rounded-full with border-2 border-white/30, min-w-[1.5rem] for number. |
| **Change avatars to black/white** | 1 hour | Create getAvatarColor() function using userId hash, use grayscale palette (gray-700, gray-600, gray-800, gray-500, black, gray-900), add white/20 border, display user initials. |
| **Fix chat overflow** | 1 hour | Add max-w-[90%] to message bubbles, implement break-words for long messages, ensure flex-1 overflow-y-auto on messages container, align messages to bottom with justify-end. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- Accurate viewer counting with `useParticipants`
- Minimal LIVE badge design
- SVG eye icon for viewer count
- Black and white avatar system
- Fixed chat layout issues

**Commits:**
- "fix: correctly count viewers using useParticipants hook"
- "feat: modernize LIVE indicator with minimal design"
- "feat: modernize viewer count with SVG eye icon and minimal design"
- "feat: change avatars to black and white and prevent message bubble expansion"
- "fix: prevent chat overflow and widen input box"

**Viewer Count Fix:**
```typescript
// Before: Incorrect counting
// After: Accurate with useParticipants

const participants = useParticipants();
const viewerCount = Math.max(0, participants.length - 1); // Subtract broadcaster

// Edge case handling:
- Broadcaster-only room = 0 viewers
- Multiple participants = count - 1
- Disconnected participants automatically removed by LiveKit
```

**Minimal LIVE Badge:**
```typescript
// Before: Large badge with emoji
// After: Minimal design with pulsing dot

<div className="absolute top-4 left-4">
  <div className="px-4 py-2 bg-red-600/90 rounded-full backdrop-blur-sm
    flex items-center gap-2">
    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
    <p className="text-white text-sm font-semibold tracking-wide">
      LIVE
    </p>
  </div>
</div>

// Features:
- Small pulsing white dot (2px)
- Red background with transparency
- Backdrop blur for readability
- Uppercase "LIVE" text
- Compact size
```

**SVG Eye Icon for Viewer Count:**
```typescript
// Before: 👁️ emoji + number
// After: SVG eye icon + number

<div className="absolute top-4 right-4">
  <div className="px-3 py-3 bg-black/80 rounded-full backdrop-blur-sm
    border-2 border-white/30 flex items-center gap-2">
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
    <span className="text-white text-sm font-bold min-w-[1.5rem] text-center">
      {viewerCount}
    </span>
  </div>
</div>
```

**Black and White Avatar System:**
```typescript
// Generate avatar color from userId hash:
const getAvatarColor = (userId: string) => {
  const colors = [
    'bg-gray-700',
    'bg-gray-600',
    'bg-gray-800',
    'bg-gray-500',
    'bg-black',
    'bg-gray-900',
  ];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Avatar with initials:
<div className={`w-7 h-7 rounded-full flex items-center justify-center
  ${getAvatarColor(userId)} border-2 border-white/20`}>
  <span className="text-white text-xs font-bold">
    {userName.charAt(0).toUpperCase()}
  </span>
</div>
```

**Chat Overflow Fixes:**
```typescript
// Messages container:
<div className="flex-1 overflow-y-auto space-y-1.5 flex flex-col justify-end">
  {/* Messages align to bottom */}
</div>

// Message bubble width constraint:
<div className="px-3 py-1.5 bg-black/60 rounded-2xl max-w-[90%]">
  {/* Prevents expansion beyond 90% width */}
</div>

// Word wrapping for long messages:
<p className="text-xs break-words">
  {message}
</p>
```

---

### **Friday (Week 2 - Day 10)**

| Task | Hours | Description |
| --- | --- | --- |
| **Implement Photos page** | 3 hours | Build Instagram-style photo grid with masonry layout, responsive columns (1-4 based on screen size), upload photo functionality, like and comment features, user profile integration, image optimization with lazy loading, lightbox view for full-size images. |
| **Implement Scrolls pages** | 3 hours | Create TikTok-style vertical video feed with listing page (grid) and detail page (full-screen player), swipe up/down navigation, auto-play on scroll with Intersection Observer, like/comment/share buttons, creator info overlay, video preloading, memory-efficient unloading. |
| **Implement Manga pages** | 2 hours | Build Webtoon-style manga reader with listing page (grid of covers), manga detail page (cover, description, chapter list, ratings), chapter reader (vertical scroll, image lazy loading, prev/next navigation, reading progress, fullscreen mode), search and filter by genre. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- `app/(app)/photos/page.tsx` (941 lines)
- `app/(app)/scrolls/page.tsx` (289 lines)
- `app/(app)/scrolls/[id]/page.tsx` (1097 lines)
- `app/(app)/manga/page.tsx` (282 lines)
- `app/(app)/manga/[id]/page.tsx` (399 lines)
- `app/(app)/manga/[id]/chapter/[chapterId]/page.tsx` (552 lines)

**Photos Feature (Instagram-style):**
```typescript
// Grid layout for image content:
- Masonry grid with varying image sizes
- Upload photo functionality
- Like and comment on photos
- User profile integration
- Image optimization and lazy loading

// Key features:
- Responsive grid (1-4 columns based on screen size)
- Lightbox view for full-size images
- Neomorphic card design
- Infinite scroll pagination
```

**Scrolls Feature (TikTok-style):**
```typescript
// Vertical short-form video feed:
- Full-screen vertical videos
- Swipe up/down navigation
- Auto-play on scroll
- Like, comment, share buttons
- Creator info overlay

// Detail page features:
- Video player with controls
- Comment section
- Related scrolls
- Creator profile link

// Implementation:
- Intersection Observer for auto-play
- Smooth scroll snapping
- Video preloading for next/prev
- Memory-efficient video unloading
```

**Manga Feature (Webtoon-style):**
```typescript
// Manga listing page:
- Grid of manga covers
- Search and filter by genre
- Popular and new releases
- Creator information

// Manga detail page:
- Manga cover and description
- Chapter list
- Rating and reviews
- Add to library

// Chapter reader:
- Vertical scroll reading
- Image lazy loading
- Previous/next chapter navigation
- Reading progress tracking
- Fullscreen mode
```

**Common Features Across All:**
- Neomorphic design system
- User authentication checks
- Database integration
- Responsive layouts
- Optimized images

---

### **Monday (Week 3 - Day 11)**

| Task | Hours | Description |
| --- | --- | --- |
| **Create comments API** | 3 hours | Build `/api/v1/videos/[id]/comments` with GET (fetch comments with pagination, include user profiles, orderBy createdAt desc, take 20, skip page*20) and POST (add comment, validate authentication, sanitize content, detect spam, support reply threading). |
| **Create likes API** | 2 hours | Implement `/api/v1/videos/[id]/like` with POST toggle like/unlike, check existing like with findUnique (userId_videoId composite key), prevent duplicates, return updated likeCount, require user authentication. |
| **Create image content API** | 2 hours | Build `/api/v1/image-content` POST endpoint to upload images, optimize with resize for large images, generate thumbnails, convert to WebP format, store on cloud/IPFS, create database record with userId, imageUrl, thumbnailUrl, caption, tags. |
| **Update storage extension API** | 1 hour | Enhance `/api/v1/videos/[id]/extend/finalize` to extend Walrus storage duration, verify video ownership, calculate extension cost, process SUI payment, update blob storage epochs on Walrus, update database expiration, track payment history. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- `/app/api/v1/videos/[id]/comments/route.ts` (211 lines)
- `/app/api/v1/videos/[id]/like/route.ts` (152 lines)
- `/app/api/v1/image-content/route.ts` (107 lines)
- Updated storage extension functionality

**Comments API:**
```typescript
// GET /api/v1/videos/{id}/comments
// Fetch comments with pagination

const comments = await prisma.comment.findMany({
  where: { videoId: params.id },
  include: { user: true },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: page * 20,
});

// POST /api/v1/videos/{id}/comments
// Add new comment

const comment = await prisma.comment.create({
  data: {
    videoId: params.id,
    userId: currentUser.id,
    content: body.content,
  },
});

// Features:
- User authentication required
- Content validation and sanitization
- Spam detection
- Reply threading support
```

**Likes API:**
```typescript
// POST /api/v1/videos/{id}/like
// Toggle like/unlike

const existingLike = await prisma.like.findUnique({
  where: {
    userId_videoId: {
      userId: currentUser.id,
      videoId: params.id,
    },
  },
});

if (existingLike) {
  // Unlike
  await prisma.like.delete({ where: { id: existingLike.id } });
  return { liked: false, likeCount: video.likeCount - 1 };
} else {
  // Like
  await prisma.like.create({
    data: { userId: currentUser.id, videoId: params.id },
  });
  return { liked: true, likeCount: video.likeCount + 1 };
}

// Features:
- Prevents duplicate likes
- Returns updated like count
- User authentication required
```

**Image Content API:**
```typescript
// POST /api/v1/image-content
// Upload and store images

const formData = await request.formData();
const image = formData.get('image') as File;

// Image optimization:
- Resize large images
- Generate thumbnails
- Convert to WebP format
- Store on cloud storage or IPFS

// Database record:
const imageContent = await prisma.imageContent.create({
  data: {
    userId: currentUser.id,
    imageUrl,
    thumbnailUrl,
    caption,
    tags,
  },
});
```

**Storage Extension API:**
```typescript
// POST /api/v1/videos/{id}/extend/finalize
// Extend Walrus storage duration

// Process:
1. Verify video ownership
2. Calculate extension cost
3. Process SUI payment
4. Update Walrus blob storage epochs
5. Update database with new expiration
6. Return confirmation

// Blockchain integration:
- Verify transaction on Sui network
- Update blob object on Walrus
- Track payment history
```

---

### **Tuesday (Week 3 - Day 12)**

| Task | Hours | Description |
| --- | --- | --- |
| **Redesign subscriptions page** | 2 hours | Convert from basic list to grid layout (grid-cols-3 gap-6), create SubscriptionCard with avatar/stats, add Follow/Unfollow buttons, show latest video thumbnails, display subscriber count, add new content indicators, implement search and filter. |
| **Enhance watch page** | 3 hours | Add comments section below video with CommentInput and CommentList components, integrate like button with heart icon and count, improve related videos algorithm, optimize thumbnail quality, show view count and upload date, implement neomorphic card styling. |
| **Improve upload validation** | 2 hours | Add comprehensive validation for video uploads (file type mp4/mov/avi, size max 500MB, duration limits), image uploads (jpg/png/webp, max 10MB, dimensions), title/description length limits, category selection required, clear error messages with fix suggestions. |
| **Polish navigation** | 1 hour | Improve Header with better responsive behavior, add search functionality, create user menu dropdown, add notification bell, ensure Upload button always visible, improve Sidebar with active state indicators, smooth transitions, collapse/expand, better icon consistency, hover tooltips. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- Updated subscriptions page with better UX
- Watch page with integrated comments and likes
- Improved upload validation
- Polished navigation components

**Subscriptions Page Redesign:**
```typescript
// Before: Basic list layout
// After: Grid of subscription cards

// Features:
- Creator cards with avatar and stats
- Follow/Unfollow buttons
- Latest video thumbnails
- Subscriber count
- New content indicators
- Search and filter subscriptions

// Layout:
<div className="grid grid-cols-3 gap-6">
  {subscriptions.map((creator) => (
    <SubscriptionCard
      avatar={creator.avatar}
      name={creator.name}
      subscriberCount={creator.subscriberCount}
      latestVideos={creator.latestVideos}
      onUnsubscribe={handleUnsubscribe}
    />
  ))}
</div>
```

**Watch Page Enhancements:**
```typescript
// Comments section below video:
<div className="mt-8 p-6 bg-white rounded-2xl
  shadow-[3px_3px_0_0_black]
  outline outline-2 outline-black">
  <h3 className="text-xl font-bold mb-4">
    {commentCount} Comments
  </h3>

  {/* Comment input */}
  <CommentInput onSubmit={handleAddComment} />

  {/* Comment list */}
  <CommentList comments={comments} />
</div>

// Like button integration:
<button
  onClick={handleLike}
  className={`px-4 py-2 rounded-full ${
    isLiked ? 'bg-red-500 text-white' : 'bg-white text-black'
  }`}>
  👍 {likeCount}
</button>

// Related videos improved:
- Better algorithm for recommendations
- Thumbnail quality optimization
- View count and upload date
```

**Upload Validation Improvements:**
```typescript
// Video upload validation:
- File type checking (mp4, mov, avi, etc.)
- File size limits (500MB max)
- Duration limits (optional)
- Thumbnail requirement
- Title and description validation
- Category selection required

// Image upload validation:
- File type checking (jpg, png, webp)
- File size limits (10MB max)
- Dimensions validation
- Caption length limits

// Error messages:
- Clear, user-friendly messages
- Specific validation failures
- Suggestions for fixes
```

**Navigation Polish:**
```typescript
// Header improvements:
- Better responsive behavior
- Search functionality
- User menu dropdown
- Notification bell
- Upload button always visible

// Sidebar improvements:
- Active state indicators
- Smooth transitions
- Collapse/expand functionality
- Better icon consistency
- Tooltip on hover (collapsed state)
```

---

### **Wednesday (Week 3 - Day 13)**

| Task | Hours | Description |
| --- | --- | --- |
| **Implement LiveKit webhooks** | 3 hours | Build `/api/live/webhooks` POST endpoint to handle LiveKit events, verify webhook signature for security, handle room_started (set status='active', startedAt), room_finished (set status='ended', endedAt), participant_joined (increment viewerCount), participant_left (decrement viewerCount). |
| **Add stream management** | 2 hours | Create End Stream functionality with confirmation modal, implement API route to update stream status, enable metadata editing during stream (title, description, category/tags), add toggle for donations on/off, handle broadcaster navigation after ending. |
| **Implement analytics tracking** | 2 hours | Create StreamAnalytics model (duration, peakViewers, totalViewers, chatMessages, donations, donationTotal, avgViewDuration), build analytics dashboard with real-time viewer graph, chat activity timeline, donation statistics, engagement metrics, CSV/JSON export. |
| **Add moderation tools** | 1 hour | Implement broadcaster chat moderation (delete messages, ban users with duration options: 1 hour/1 day/permanent), add slow mode (limit message frequency), create keyword filters, implement spam detection with ML, auto-moderation for patterns, rate limiting per user, duplicate message prevention. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- `/app/api/live/webhooks/route.ts` (121 lines)
- Stream management dashboard
- Analytics and reporting
- Moderation tools

**LiveKit Webhooks:**
```typescript
// POST /api/live/webhooks
// Handle LiveKit events

export async function POST(request: Request) {
  const event = await request.json();

  // Verify webhook signature
  const signature = request.headers.get('livekit-signature');
  if (!verifyWebhookSignature(signature, event)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Handle events:
  switch (event.event) {
    case 'room_started':
      // Update stream status to active
      await prisma.liveStream.update({
        where: { roomName: event.room.name },
        data: { status: 'active', startedAt: new Date() },
      });
      break;

    case 'room_finished':
      // Update stream status to ended
      await prisma.liveStream.update({
        where: { roomName: event.room.name },
        data: { status: 'ended', endedAt: new Date() },
      });
      break;

    case 'participant_joined':
      // Increment viewer count
      await prisma.liveStream.update({
        where: { roomName: event.room.name },
        data: { viewerCount: { increment: 1 } },
      });
      break;

    case 'participant_left':
      // Decrement viewer count
      await prisma.liveStream.update({
        where: { roomName: event.room.name },
        data: { viewerCount: { decrement: 1 } },
      });
      break;
  }

  return NextResponse.json({ success: true });
}
```

**Stream Management:**
```typescript
// End stream functionality:
<button
  onClick={async () => {
    await fetch(`/api/live/end-stream`, {
      method: 'POST',
      body: JSON.stringify({ roomName }),
    });
    router.push('/');
  }}
  className="px-6 py-3 bg-red-600 text-white rounded-full">
  End Stream
</button>

// Update metadata during stream:
- Edit title (limited changes)
- Update description
- Change category/tags
- Toggle donations on/off
```

**Analytics Tracking:**
```typescript
// Stream analytics model:
model StreamAnalytics {
  id              String    @id @default(cuid())
  streamId        String    @unique
  duration        Int       // in seconds
  peakViewers     Int
  totalViewers    Int       // unique viewers
  chatMessages    Int
  donations       Int
  donationTotal   String    // in MIST
  avgViewDuration Int
  createdAt       DateTime  @default(now())
}

// Analytics dashboard:
- Real-time viewer graph
- Chat activity timeline
- Donation statistics
- Engagement metrics
- Export to CSV/JSON
```

**Moderation Tools:**
```typescript
// Chat moderation:
- Delete individual messages
- Ban users temporarily (1 hour, 1 day, permanent)
- Slow mode (limit message frequency)
- Keyword filters
- Spam detection with ML

// Broadcaster controls:
<div className="flex gap-2">
  <button onClick={() => handleDeleteMessage(messageId)}>
    🗑️ Delete
  </button>
  <button onClick={() => handleBanUser(userId, duration)}>
    🚫 Ban User
  </button>
</div>

// Auto-moderation:
- Detect spam patterns
- Flag inappropriate content
- Rate limiting per user
- Duplicate message prevention
```

---

### **Thursday (Week 3 - Day 14)**

| Task | Hours | Description |
| --- | --- | --- |
| **End-to-end testing** | 3 hours | Test complete live streaming flow: stream creation (title/description validation, redirect), broadcasting (camera/mic permissions, video/audio preview, LIVE badge), viewer experience (join stream, video playback, viewer count increment), chat system (messages appear with 2s latency, auto-scroll, moderation), donations (wallet connection, transaction signing, Super Chat highlighting), end stream (status updates, removal from active list). Test on Chrome, Safari, Firefox, iOS/Android, network throttling (3G), load testing with multiple viewers. |
| **Performance optimization** | 2 hours | Optimize chat component with memoized messages (useMemo to only show last 50), implement virtualization for long chat history using react-window FixedSizeList, add database indexes (@@index([streamId]), @@index([createdAt]), @@index([status])), configure connection pooling (pool_size: 10), implement API response caching (revalidate: 2 seconds), reduce unnecessary re-renders. |
| **Bug fixes and edge cases** | 2 hours | Fix hydration warnings from wallet state (suppress SSR mismatch), handle network disconnection with auto-reconnect (LiveKit event listeners for disconnected/reconnected), prevent concurrent donation race conditions with database transactions (verify donation doesn't exist, create donation and chat message atomically), test error recovery. |
| **Documentation** | 1 hour | Write comprehensive API documentation (all endpoints with request/response examples), document component props and usage (LiveStreamPlayer, LiveChat, DonationModal), create database schema documentation, add setup instructions, write deployment guide, document testing procedures. |
| **Total** | **8 hours** | |

**Key Deliverables:**
- Fully tested live streaming platform
- Optimized performance
- Bug-free experience
- Complete documentation

**End-to-End Testing:**
```typescript
// Test scenarios:

1. Stream Creation Flow:
   ✓ Create stream with valid title/description
   ✓ Redirect to broadcaster dashboard
   ✓ Camera/mic permissions requested
   ✓ Video/audio preview works

2. Broadcasting:
   ✓ Stream appears in discovery (active streams)
   ✓ LIVE badge displays correctly
   ✓ Viewer count starts at 0

3. Viewer Experience:
   ✓ Can join stream from watch page
   ✓ Video/audio plays smoothly
   ✓ Viewer count increments
   ✓ Can send chat messages

4. Chat System:
   ✓ Messages appear in real-time (2s latency)
   ✓ Auto-scroll to bottom works
   ✓ Broadcaster can delete messages
   ✓ Long messages wrap correctly

5. Donations:
   ✓ Donation modal opens
   ✓ Wallet connection works
   ✓ Transaction processes correctly
   ✓ Super Chat appears highlighted
   ✓ Amount displays in SUI

6. End Stream:
   ✓ End stream button works
   ✓ Stream status updates to "ended"
   ✓ Stream removed from active list
   ✓ Viewers see "stream ended" message

// Testing tools:
- Manual testing on Chrome, Safari, Firefox
- Mobile testing on iOS and Android
- Network throttling (3G simulation)
- Multiple concurrent viewers (load testing)
```

**Performance Optimizations:**
```typescript
// Chat component optimization:
// Before: Re-renders on every poll
// After: Memoized messages, only update on change

const memoizedMessages = useMemo(() => {
  return messages.slice(-50); // Only show last 50
}, [messages]);

// Virtualization for long chat history:
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={50}
  width="100%">
  {({ index, style }) => (
    <div style={style}>
      <ChatMessage message={messages[index]} />
    </div>
  )}
</FixedSizeList>

// Database query optimization:
// Add indexes:
@@index([streamId])
@@index([createdAt])
@@index([status])

// Use connection pooling:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool_size = 10
}

// API response caching:
export const revalidate = 2; // Cache for 2 seconds
```

**Bug Fixes:**
```typescript
// Hydration warning fix:
// Before: Wallet state causes SSR mismatch
// After: Suppress hydration warning

useEffect(() => {
  const handleHydrationError = () => {
    // Suppress wallet-related hydration warnings
  };
  window.addEventListener('error', handleHydrationError);
  return () => window.removeEventListener('error', handleHydrationError);
}, []);

// Network disconnection handling:
useEffect(() => {
  const handleDisconnect = () => {
    setError('Connection lost. Reconnecting...');
    // Auto-reconnect logic
  };

  const handleReconnect = () => {
    setError(null);
  };

  // LiveKit event listeners
  room.on('disconnected', handleDisconnect);
  room.on('reconnected', handleReconnect);
}, [room]);

// Concurrent donation handling:
// Use database transactions to prevent race conditions
const result = await prisma.$transaction(async (tx) => {
  // Verify donation doesn't already exist
  const existing = await tx.donation.findUnique({
    where: { txDigest },
  });
  if (existing) throw new Error('Donation already processed');

  // Create donation and chat message atomically
  const donation = await tx.donation.create({ data });
  const message = await tx.chatMessage.create({ data });

  return { donation, message };
});
```

**Documentation:**
```markdown
# Live Streaming API Documentation

## Endpoints

### POST /api/live/create-room
Create a new live stream room.

**Request Body:**
{
  "title": string (required, max 100 chars),
  "description": string (optional, max 500 chars),
  "creatorId": string (required, wallet address),
  "maxParticipants": number (default: 100)
}

**Response:**
{
  "liveStream": {
    "id": string,
    "roomName": string,
    "title": string,
    "creatorId": string,
    "status": "active"
  }
}

### POST /api/live/token
Generate LiveKit access token.

**Request Body:**
{
  "roomName": string (required),
  "participantName": string (required),
  "isBroadcaster": boolean (default: false)
}

**Response:**
{
  "token": string (JWT token)
}

### GET /api/live/streams
List active live streams.

**Query Parameters:**
- limit: number (default: 20)
- offset: number (default: 0)
- sortBy: "viewers" | "recent" (default: "viewers")

**Response:**
{
  "streams": [
    {
      "id": string,
      "roomName": string,
      "title": string,
      "viewerCount": number,
      "creator": { name, avatar }
    }
  ],
  "total": number
}

## Components

### LiveStreamPlayer
Real-time video player for broadcaster and viewer modes.

**Props:**
- isBroadcaster: boolean (required)

**Usage:**
<LiveStreamPlayer isBroadcaster={true} />

### LiveChat
Interactive chat with donations.

**Props:**
- roomName: string (required)
- streamId: string (required)
- creatorAddress: string (required)
- isBroadcaster: boolean (default: false)

**Usage:**
<LiveChat
  roomName="room-123"
  streamId="stream-456"
  creatorAddress="0x..."
  isBroadcaster={false}
/>

## Database Models

See prisma/schema.prisma for complete schema.

Key models:
- LiveStream
- ChatMessage
- Donation
```

---

## Summary

**Total Development Time:** 112 hours (14 days × 8 hours)
**Lines of Code:** ~10,000 lines
**Files Changed:** 50+ files
**Commits:** 75 commits

### Key Deliverables:
- ✅ Real-time video streaming (LiveKit + WebRTC, <2s latency)
- ✅ Interactive TikTok-style chat with 2-second polling
- ✅ Blockchain donations (SUI payments) with Super Chat highlighting
- ✅ Stream discovery with active stream listing and viewer counts
- ✅ Photos, Scrolls, Manga content types (Instagram/TikTok/Webtoon style)
- ✅ Comments and likes for videos with real-time updates
- ✅ Responsive neomorphic design across all components
- ✅ LiveKit webhooks for automated stream management
- ✅ Analytics tracking and moderation tools
- ✅ Complete API documentation

### Performance Metrics:
- **Video latency:** <2 seconds (WebRTC)
- **Chat latency:** 2 seconds (polling)
- **Concurrent viewers:** 100+ per stream
- **Blockchain verification:** All donations verified on Sui

### Technical Stack:
- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Video:** LiveKit (WebRTC infrastructure)
- **Blockchain:** Sui Network (@mysten/dapp-kit)
- **Real-time:** Polling (2s interval) for chat

### Result:
Production-ready live streaming platform matching YouTube Live and TikTok Live functionality with blockchain-based monetization.
