# KrillTube Live Streaming - Advanced Features Implementation Plan

## Overview

This document outlines the implementation plan for adding **screen sharing**, **viewer participation**, and **multi-streamer functionality** to KrillTube's existing live streaming platform.

### Reference Implementation

The `/livestream` directory contains a complete LiveKit-based reference implementation with:
- ✅ Raise hand system (viewers request to join)
- ✅ Invite to stage (host invites viewers to become co-hosts)
- ✅ Remove from stage (host removes participants or participant leaves)
- ✅ Participant metadata tracking
- ✅ Permission management (canPublish for broadcasting)
- ✅ Presence dialog (hosts vs viewers UI)

### New Features to Add

1. **Screen Sharing** - Streamers can share their screen during live streams
2. **Viewer Participation** - Viewers can raise hand, get invited, and join as co-hosts with audio/video
3. **Multi-Streamer Invitations** - Stream creator can invite specific users to join before stream starts
4. **Request-to-Join with Approval** - Other streamers can request to join and get approved

---

## Architecture Overview

### Database Schema Additions

#### Prisma Schema Updates

```prisma
// Existing LiveStream model - add new fields
model LiveStream {
  id                  String   @id @default(cuid())
  roomName            String   @unique
  title               String
  description         String?
  creatorId           String
  status              String   @default("active")
  viewerCount         Int      @default(0)
  startedAt           DateTime @default(now())
  endedAt             DateTime?

  // NEW FIELDS
  allowParticipation  Boolean  @default(false)  // Enable raise hand/invite system
  maxCoHosts          Int      @default(5)       // Max number of co-hosts allowed
  requireApproval     Boolean  @default(true)    // Require approval for co-host requests

  chatMessages        ChatMessage[]
  donations           Donation[]
  invitations         StreamInvitation[]       // NEW
  joinRequests        StreamJoinRequest[]      // NEW
  participants        StreamParticipant[]      // NEW

  @@index([creatorId])
  @@index([status])
}

// NEW MODEL: Stream Invitations
model StreamInvitation {
  id          String    @id @default(cuid())
  streamId    String
  stream      LiveStream @relation(fields: [streamId], references: [id], onDelete: Cascade)

  inviterId   String    // User who sent invitation
  inviteeId   String    // User who received invitation
  inviteeName String    // Display name

  status      String    @default("pending") // pending, accepted, rejected, expired

  sentAt      DateTime  @default(now())
  respondedAt DateTime?

  @@index([streamId])
  @@index([inviteeId])
  @@unique([streamId, inviteeId])
}

// NEW MODEL: Join Requests (raise hand)
model StreamJoinRequest {
  id          String    @id @default(cuid())
  streamId    String
  stream      LiveStream @relation(fields: [streamId], references: [id], onDelete: Cascade)

  requesterId String    // User requesting to join
  requesterName String

  status      String    @default("pending") // pending, approved, rejected
  message     String?   // Optional message from requester

  requestedAt DateTime  @default(now())
  respondedAt DateTime?
  respondedBy String?   // Admin who approved/rejected

  @@index([streamId])
  @@index([requesterId])
}

// NEW MODEL: Active Participants (co-hosts)
model StreamParticipant {
  id              String    @id @default(cuid())
  streamId        String
  stream          LiveStream @relation(fields: [streamId], references: [id], onDelete: Cascade)

  userId          String
  userName        String

  role            String    @default("viewer") // creator, co-host, viewer

  // Permissions
  canPublish      Boolean   @default(false)
  canPublishScreen Boolean   @default(false)

  // Metadata
  handRaised      Boolean   @default(false)
  invitedToStage  Boolean   @default(false)
  isScreenSharing Boolean   @default(false)

  joinedAt        DateTime  @default(now())
  leftAt          DateTime?

  @@index([streamId])
  @@index([userId])
  @@unique([streamId, userId])
}
```

---

## Feature 1: Screen Sharing

### Implementation Steps

#### 1. Add Screen Share Control to LiveStreamPlayer

**File**: `components/LiveStreamPlayer.tsx`

```typescript
// Add screen sharing state
const [isScreenSharing, setIsScreenSharing] = useState(false);
const [screenTrack, setScreenTrack] = useState<LocalVideoTrack | null>(null);

// Screen sharing function
const toggleScreenShare = async () => {
  try {
    if (!isScreenSharing) {
      // Start screen sharing
      const screenTracks = await createLocalTracks({
        audio: false,
        video: {
          source: Track.Source.ScreenShare,
        },
      });

      const screenVideoTrack = screenTracks.find(
        (t) => t.kind === Track.Kind.Video
      ) as LocalVideoTrack;

      if (screenVideoTrack && room) {
        await room.localParticipant.publishTrack(screenVideoTrack);
        setScreenTrack(screenVideoTrack);
        setIsScreenSharing(true);

        // Update participant metadata
        await updateParticipantMetadata({
          ...currentMetadata,
          isScreenSharing: true,
        });
      }
    } else {
      // Stop screen sharing
      if (screenTrack && room) {
        await room.localParticipant.unpublishTrack(screenTrack);
        screenTrack.stop();
        setScreenTrack(null);
        setIsScreenSharing(false);

        await updateParticipantMetadata({
          ...currentMetadata,
          isScreenSharing: false,
        });
      }
    }
  } catch (error) {
    console.error('Screen share error:', error);
    // Show error toast
  }
};

// Add screen share button to UI
<button
  onClick={toggleScreenShare}
  className="px-4 py-2 bg-white/90 rounded-full
    shadow-[3px_3px_0_0_black]
    outline outline-2 outline-black
    hover:shadow-[2px_2px_0_0_black]
    hover:translate-x-[1px]
    hover:translate-y-[1px]
    transition-all">
  <div className="flex items-center gap-2">
    <svg className="w-5 h-5" fill="none" stroke="currentColor">
      {/* Screen share icon */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
    <span className="text-sm font-semibold">
      {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
    </span>
  </div>
</button>
```

#### 2. Display Screen Share Tracks

```typescript
// Subscribe to screen share tracks
const screenShareTracks = useTracks([Track.Source.ScreenShare]);

// Render screen shares in video grid
{screenShareTracks.map((track) => (
  <div key={track.participant.identity + '-screen'}
    className="relative col-span-2">
    {/* Full-width screen share */}
    <VideoTrack
      trackRef={track}
      className="w-full h-full object-contain bg-black"
    />
    <div className="absolute top-4 left-4
      px-4 py-2 bg-black/80 rounded-full backdrop-blur-sm">
      <p className="text-white text-sm font-semibold">
        {track.participant.name}'s screen
      </p>
    </div>
  </div>
))}
```

#### 3. API Endpoint for Screen Share Tracking

**File**: `app/api/live/screen-share/route.ts`

```typescript
export async function POST(req: Request) {
  const { streamId, userId, isSharing } = await req.json();

  // Update participant metadata
  await prisma.streamParticipant.update({
    where: {
      streamId_userId: {
        streamId,
        userId,
      },
    },
    data: {
      isScreenSharing: isSharing,
    },
  });

  return Response.json({ success: true });
}
```

---

## Feature 2: Viewer Participation (Raise Hand System)

### Implementation Steps

#### 1. Add Raise Hand Button for Viewers

**File**: `components/LiveChat.tsx` or separate `components/ViewerParticipation.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export function ViewerParticipation({
  streamId,
  isCreator,
  currentParticipant
}: {
  streamId: string;
  isCreator: boolean;
  currentParticipant?: StreamParticipant;
}) {
  const [handRaised, setHandRaised] = useState(
    currentParticipant?.handRaised || false
  );
  const currentAccount = useCurrentAccount();

  const handleRaiseHand = async () => {
    if (!currentAccount) return;

    try {
      const response = await fetch('/api/live/raise-hand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          userId: currentAccount.address,
          userName: currentAccount.label || `User-${currentAccount.address.slice(0, 6)}`,
          message: 'Would like to join the stream',
        }),
      });

      if (response.ok) {
        setHandRaised(true);
      }
    } catch (error) {
      console.error('Raise hand error:', error);
    }
  };

  const handleLowerHand = async () => {
    try {
      await fetch('/api/live/raise-hand', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId }),
      });

      setHandRaised(false);
    } catch (error) {
      console.error('Lower hand error:', error);
    }
  };

  if (isCreator) return null;

  return (
    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
      {!currentParticipant?.invitedToStage && !handRaised && (
        <button
          onClick={handleRaiseHand}
          className="w-full px-4 py-3 bg-white text-black font-bold
            rounded-full
            shadow-[3px_3px_0_0_black]
            outline outline-2 outline-black
            hover:shadow-[2px_2px_0_0_black]
            hover:translate-x-[1px]
            hover:translate-y-[1px]
            transition-all">
          ✋ Request to Join Stream
        </button>
      )}

      {handRaised && !currentParticipant?.invitedToStage && (
        <div className="flex flex-col gap-2">
          <div className="px-4 py-2 bg-yellow-400 text-black rounded-full text-center">
            <p className="text-sm font-semibold">
              ⏳ Request sent - Waiting for approval
            </p>
          </div>
          <button
            onClick={handleLowerHand}
            className="px-4 py-2 bg-white/20 text-white rounded-full text-sm">
            Cancel Request
          </button>
        </div>
      )}

      {currentParticipant?.invitedToStage && (
        <div className="px-4 py-2 bg-green-400 text-black rounded-full text-center">
          <p className="text-sm font-semibold">
            ✅ You're invited! Click "Join Stream" to go live
          </p>
        </div>
      )}
    </div>
  );
}
```

#### 2. Raise Hand API Endpoints

**File**: `app/api/live/raise-hand/route.ts`

```typescript
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// POST - Raise hand
export async function POST(req: Request) {
  try {
    const { streamId, userId, userName, message } = await req.json();

    // Check if already raised hand
    const existing = await prisma.streamJoinRequest.findFirst({
      where: {
        streamId,
        requesterId: userId,
        status: 'pending',
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Request already pending' },
        { status: 400 }
      );
    }

    // Create join request
    const joinRequest = await prisma.streamJoinRequest.create({
      data: {
        streamId,
        requesterId: userId,
        requesterName: userName,
        message,
        status: 'pending',
      },
    });

    // Update participant metadata
    await prisma.streamParticipant.upsert({
      where: {
        streamId_userId: {
          streamId,
          userId,
        },
      },
      create: {
        streamId,
        userId,
        userName,
        role: 'viewer',
        handRaised: true,
      },
      update: {
        handRaised: true,
      },
    });

    return NextResponse.json({ success: true, joinRequest });
  } catch (error) {
    console.error('Raise hand error:', error);
    return NextResponse.json(
      { error: 'Failed to raise hand' },
      { status: 500 }
    );
  }
}

// DELETE - Lower hand
export async function DELETE(req: Request) {
  try {
    const { streamId, userId } = await req.json();

    // Update join request to rejected
    await prisma.streamJoinRequest.updateMany({
      where: {
        streamId,
        requesterId: userId,
        status: 'pending',
      },
      data: {
        status: 'rejected',
        respondedAt: new Date(),
      },
    });

    // Update participant metadata
    await prisma.streamParticipant.updateMany({
      where: {
        streamId,
        userId,
      },
      data: {
        handRaised: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lower hand error:', error);
    return NextResponse.json(
      { error: 'Failed to lower hand' },
      { status: 500 }
    );
  }
}
```

#### 3. Host Invitation Panel (Approve/Reject Requests)

**File**: `components/ParticipantManagementPanel.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface JoinRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  message?: string;
  requestedAt: Date;
}

export function ParticipantManagementPanel({
  streamId,
  isCreator
}: {
  streamId: string;
  isCreator: boolean;
}) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (!isCreator) return;

    const fetchRequests = async () => {
      const response = await fetch(`/api/live/join-requests?streamId=${streamId}`);
      const data = await response.json();
      setRequests(data.requests || []);
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [streamId, isCreator]);

  const handleApprove = async (requestId: string, userId: string) => {
    try {
      await fetch('/api/live/invite-to-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          requestId,
          userId,
        }),
      });

      // Remove from requests list
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await fetch('/api/live/join-requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  if (!isCreator || requests.length === 0) return null;

  return (
    <div className="absolute top-20 right-4 w-80
      bg-white rounded-2xl
      shadow-[5px_5px_0_0_black]
      outline outline-3 outline-black
      p-4 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">
        Join Requests ({requests.length})
      </h3>

      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id}
            className="p-3 bg-[#FFEEE5] rounded-xl
              outline outline-2 outline-black">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-black rounded-full
                flex items-center justify-center">
                <span className="text-white font-bold">
                  {request.requesterName.charAt(0)}
                </span>
              </div>

              <div className="flex-1">
                <p className="font-bold text-sm">{request.requesterName}</p>
                {request.message && (
                  <p className="text-xs text-black/70 mt-1">
                    {request.message}
                  </p>
                )}
                <p className="text-xs text-black/50 mt-1">
                  {new Date(request.requestedAt).toLocaleTimeString()}
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleApprove(request.id, request.requesterId)}
                    className="flex-1 px-3 py-1.5 bg-green-500 text-white
                      rounded-full text-xs font-semibold
                      shadow-[2px_2px_0_0_black]
                      outline outline-2 outline-black
                      hover:shadow-[1px_1px_0_0_black]
                      transition-all">
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex-1 px-3 py-1.5 bg-red-500 text-white
                      rounded-full text-xs font-semibold
                      shadow-[2px_2px_0_0_black]
                      outline outline-2 outline-black
                      hover:shadow-[1px_1px_0_0_black]
                      transition-all">
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 4. Invite to Stage API

**File**: `app/api/live/invite-to-stage/route.ts`

```typescript
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { streamId, requestId, userId } = await req.json();

    // Update join request to approved
    if (requestId) {
      await prisma.streamJoinRequest.update({
        where: { id: requestId },
        data: {
          status: 'approved',
          respondedAt: new Date(),
        },
      });
    }

    // Update participant to co-host with publish permissions
    await prisma.streamParticipant.update({
      where: {
        streamId_userId: {
          streamId,
          userId,
        },
      },
      data: {
        role: 'co-host',
        invitedToStage: true,
        canPublish: true,
        canPublishScreen: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invite to stage error:', error);
    return NextResponse.json(
      { error: 'Failed to invite to stage' },
      { status: 500 }
    );
  }
}
```

---

## Feature 3: Multi-Streamer Invitations (Pre-Stream)

### Implementation Steps

#### 1. Stream Creation with Invitations

**File**: `app/live/create/page.tsx` - Add invitation section

```typescript
// Add invitation state
const [invitations, setInvitations] = useState<string[]>([]);
const [inviteAddress, setInviteAddress] = useState('');

const handleAddInvitation = () => {
  if (inviteAddress && !invitations.includes(inviteAddress)) {
    setInvitations([...invitations, inviteAddress]);
    setInviteAddress('');
  }
};

const handleCreateStream = async () => {
  // ... existing stream creation code

  // Send invitations
  if (invitations.length > 0) {
    await fetch('/api/live/send-invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streamId: data.liveStream.id,
        inviteeAddresses: invitations,
        inviterId: currentAccount.address,
      }),
    });
  }

  router.push(`/live/broadcast/${data.liveStream.roomName}`);
};

// Add invitation UI in the form
<div className="space-y-4">
  <label className="block">
    <span className="text-lg font-semibold">
      Invite Co-Hosts (Optional)
    </span>
    <p className="text-sm text-black/70 mb-2">
      Invite other streamers to join your stream
    </p>

    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Wallet address or username"
        value={inviteAddress}
        onChange={(e) => setInviteAddress(e.target.value)}
        className="flex-1 px-4 py-3 bg-white rounded-xl
          outline outline-2 outline-black
          focus:outline-[3px]"
      />
      <button
        type="button"
        onClick={handleAddInvitation}
        className="px-6 py-3 bg-[#1AAACE] text-white rounded-xl
          font-semibold
          shadow-[3px_3px_0_0_black]
          outline outline-2 outline-black
          hover:shadow-[2px_2px_0_0_black]
          transition-all">
        Add
      </button>
    </div>
  </label>

  {/* Display invited users */}
  {invitations.length > 0 && (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Invited Co-Hosts:</p>
      {invitations.map((addr) => (
        <div key={addr}
          className="flex items-center justify-between
            px-4 py-2 bg-[#FFEEE5] rounded-xl
            outline outline-2 outline-black">
          <span className="text-sm">{addr}</span>
          <button
            type="button"
            onClick={() => setInvitations(invitations.filter(a => a !== addr))}
            className="text-red-500 font-bold">
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
</div>
```

#### 2. Send Invitations API

**File**: `app/api/live/send-invitations/route.ts`

```typescript
export async function POST(req: Request) {
  try {
    const { streamId, inviteeAddresses, inviterId } = await req.json();

    // Create invitations for each user
    const invitations = await Promise.all(
      inviteeAddresses.map(async (address: string) => {
        return prisma.streamInvitation.create({
          data: {
            streamId,
            inviterId,
            inviteeId: address,
            inviteeName: address.slice(0, 10) + '...',
            status: 'pending',
          },
        });
      })
    );

    // TODO: Send notification/email to invited users

    return NextResponse.json({ success: true, invitations });
  } catch (error) {
    console.error('Send invitations error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitations' },
      { status: 500 }
    );
  }
}
```

#### 3. Invitation Notification System

**File**: `components/InvitationNotifications.tsx`

```typescript
'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';

interface Invitation {
  id: string;
  streamId: string;
  stream: {
    title: string;
    roomName: string;
    creator: {
      name: string;
    };
  };
  inviterId: string;
  sentAt: Date;
}

export function InvitationNotifications() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    if (!currentAccount) return;

    const fetchInvitations = async () => {
      const response = await fetch(
        `/api/live/invitations?userId=${currentAccount.address}`
      );
      const data = await response.json();
      setInvitations(data.invitations || []);
    };

    fetchInvitations();
    const interval = setInterval(fetchInvitations, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [currentAccount]);

  const handleAccept = async (invitationId: string, roomName: string) => {
    try {
      await fetch('/api/live/accept-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      });

      // Navigate to broadcast page
      window.location.href = `/live/broadcast/${roomName}`;
    } catch (error) {
      console.error('Accept invitation error:', error);
    }
  };

  const handleReject = async (invitationId: string) => {
    try {
      await fetch('/api/live/reject-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      });

      setInvitations(invitations.filter(i => i.id !== invitationId));
    } catch (error) {
      console.error('Reject invitation error:', error);
    }
  };

  if (invitations.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-3">
      {invitations.map((invitation) => (
        <div key={invitation.id}
          className="p-4 bg-white rounded-2xl
            shadow-[5px_5px_0_0_black]
            outline outline-3 outline-black
            animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#EF4330] to-[#1AAACE]
              rounded-full flex items-center justify-center
              outline outline-2 outline-black">
              <span className="text-white text-xl">📹</span>
            </div>

            <div className="flex-1">
              <p className="font-bold text-sm">Stream Invitation</p>
              <p className="text-xs text-black/70 mt-1">
                {invitation.stream.creator.name} invited you to join:
              </p>
              <p className="text-sm font-semibold mt-1">
                {invitation.stream.title}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAccept(invitation.id, invitation.stream.roomName)}
                  className="flex-1 px-3 py-2 bg-green-500 text-white
                    rounded-full text-xs font-bold
                    shadow-[2px_2px_0_0_black]
                    outline outline-2 outline-black
                    hover:shadow-[1px_1px_0_0_black]
                    transition-all">
                  Join Stream
                </button>
                <button
                  onClick={() => handleReject(invitation.id)}
                  className="px-3 py-2 bg-white text-black
                    rounded-full text-xs font-semibold
                    outline outline-2 outline-black
                    hover:bg-gray-100
                    transition-all">
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Integration Checklist

### Phase 1: Database & Backend (Week 1)

- [ ] Add new Prisma models (StreamInvitation, StreamJoinRequest, StreamParticipant)
- [ ] Run database migration
- [ ] Create API endpoints:
  - [ ] `/api/live/raise-hand` (POST, DELETE)
  - [ ] `/api/live/invite-to-stage` (POST)
  - [ ] `/api/live/remove-from-stage` (POST)
  - [ ] `/api/live/send-invitations` (POST)
  - [ ] `/api/live/accept-invitation` (POST)
  - [ ] `/api/live/reject-invitation` (POST)
  - [ ] `/api/live/join-requests` (GET, DELETE)
  - [ ] `/api/live/screen-share` (POST)

### Phase 2: Screen Sharing (Week 2)

- [ ] Add screen share toggle button to LiveStreamPlayer
- [ ] Implement createLocalTracks for screen sharing
- [ ] Add screen share track rendering
- [ ] Test screen sharing on broadcaster side
- [ ] Test screen sharing on viewer side
- [ ] Add screen share indicator badges

### Phase 3: Viewer Participation (Week 2-3)

- [ ] Create ViewerParticipation component
- [ ] Add "Raise Hand" button for viewers
- [ ] Create ParticipantManagementPanel for creators
- [ ] Implement polling for join requests (3-second interval)
- [ ] Add approve/reject functionality
- [ ] Test full raise hand → approve → go live flow
- [ ] Add participant role badges (creator, co-host, viewer)

### Phase 4: Multi-Streamer Invitations (Week 3)

- [ ] Add invitation section to stream creation page
- [ ] Create InvitationNotifications component
- [ ] Implement invitation accept/reject flow
- [ ] Add invitation polling system
- [ ] Test pre-stream invitation flow
- [ ] Add notification badges for pending invitations

### Phase 5: UI/UX Polish (Week 4)

- [ ] Apply neomorphic design to all new components
- [ ] Add animations for notifications
- [ ] Implement toast notifications for actions
- [ ] Add loading states
- [ ] Add error handling with user-friendly messages
- [ ] Mobile responsive testing
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

### Phase 6: Testing & Deployment (Week 4)

- [ ] Test with multiple users simultaneously
- [ ] Test all permission scenarios
- [ ] Test screen sharing with multiple co-hosts
- [ ] Load testing (10+ viewers, 3+ co-hosts)
- [ ] Browser compatibility testing
- [ ] Mobile device testing
- [ ] Update documentation
- [ ] Deploy to production

---

## Performance Considerations

### LiveKit Configuration

```typescript
// Optimize for multiple publishers
const roomOptions = {
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: {
    resolution: VideoPresets.h720.resolution,
  },
  publishDefaults: {
    simulcast: true, // Enable simulcast for better quality adaptation
  },
};
```

### Polling Optimization

```typescript
// Use efficient polling intervals
const POLL_INTERVALS = {
  JOIN_REQUESTS: 3000,    // 3 seconds for pending requests
  INVITATIONS: 10000,     // 10 seconds for invitations
  CHAT_MESSAGES: 2000,    // 2 seconds for chat (existing)
};

// Stop polling when not needed
useEffect(() => {
  if (!isCreator || !streamActive) {
    return; // Don't poll if not creator or stream inactive
  }

  const interval = setInterval(fetchRequests, POLL_INTERVALS.JOIN_REQUESTS);
  return () => clearInterval(interval);
}, [isCreator, streamActive]);
```

---

## Security Considerations

### Permission Validation

```typescript
// Always validate on server-side
export async function POST(req: Request) {
  const { streamId, userId } = await req.json();

  // Verify user is the stream creator
  const stream = await prisma.liveStream.findUnique({
    where: { id: streamId },
  });

  if (stream.creatorId !== userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  // ... proceed with action
}
```

### Rate Limiting

```typescript
// Limit raise hand requests
const RATE_LIMITS = {
  RAISE_HAND: {
    maxAttempts: 3,
    windowMs: 60000, // 1 minute
  },
};
```

---

## Expected User Flows

### Flow 1: Viewer Joins as Co-Host

1. Viewer watches live stream
2. Clicks "Request to Join Stream" button
3. Request appears in broadcaster's "Join Requests" panel
4. Broadcaster clicks "Accept"
5. Viewer receives notification "You're invited!"
6. Viewer clicks "Join Stream"
7. LiveKit grants publish permissions
8. Viewer's camera/mic activates
9. Viewer appears in video grid as co-host
10. Viewer can optionally share screen

### Flow 2: Pre-Stream Invitation

1. Streamer creates new stream
2. Adds wallet addresses in "Invite Co-Hosts" section
3. Creates stream
4. Invited users receive notification
5. Invited user clicks "Join Stream"
6. User joins as co-host when stream starts
7. Both streamers broadcast simultaneously

### Flow 3: Screen Sharing

1. Active broadcaster clicks "Share Screen"
2. Browser prompts for screen selection
3. Screen share track published to LiveKit
4. Screen appears in video grid (full-width)
5. All viewers see the shared screen
6. Broadcaster clicks "Stop Sharing" to end

---

## Summary

This implementation plan leverages the existing LiveKit infrastructure and adds three major features:

1. **Screen Sharing**: Simple toggle with full-width display
2. **Viewer Participation**: Complete raise hand → approve → go live flow
3. **Multi-Streamer**: Pre-stream invitations and real-time join requests

Total estimated development time: **4 weeks** (based on 8 hours/day)

All features integrate seamlessly with the current KrillTube design system (neomorphic cards, black outlines, shadows, rounded corners) and blockchain infrastructure (Sui wallet integration).
