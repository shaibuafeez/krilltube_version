import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { RoomServiceClient } from 'livekit-server-sdk';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST - Sync participants from LiveKit room to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId } = body;

    if (!streamId) {
      return NextResponse.json(
        { error: 'streamId is required' },
        { status: 400 }
      );
    }

    // Get stream info
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Get participants from LiveKit room
    const livekitHost = process.env.LIVEKIT_URL || 'http://localhost:7880';
    const roomService = new RoomServiceClient(
      livekitHost,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!
    );

    let liveKitParticipants;
    try {
      liveKitParticipants = await roomService.listParticipants(stream.roomName);
    } catch (err) {
      console.error('[Sync Participants] Error fetching from LiveKit:', err);
      return NextResponse.json(
        { error: 'Failed to fetch participants from LiveKit' },
        { status: 500 }
      );
    }

    console.log('[Sync Participants] Found', liveKitParticipants.length, 'participants in LiveKit room');

    // Create/update participant records for each LiveKit participant
    const synced = [];
    for (const participant of liveKitParticipants) {
      // Determine role based on permissions
      let role = 'viewer';
      if (participant.identity === stream.creatorId) {
        role = 'creator';
      } else if (participant.permission?.canPublish) {
        role = 'co-host';
      }

      const participantRecord = await prisma.streamParticipant.upsert({
        where: {
          streamId_userId: {
            streamId: stream.id,
            userId: participant.identity,
          },
        },
        create: {
          streamId: stream.id,
          userId: participant.identity,
          userName: participant.name || `User-${participant.identity.slice(0, 8)}`,
          role,
          canPublish: participant.permission?.canPublish || false,
          canPublishScreen: participant.permission?.canPublish || false,
        },
        update: {
          userName: participant.name || `User-${participant.identity.slice(0, 8)}`,
          leftAt: null, // Mark as active
        },
      });

      synced.push(participantRecord);
    }

    console.log('[Sync Participants] Synced', synced.length, 'participants to database');

    return NextResponse.json({
      success: true,
      synced: synced.length,
      participants: synced,
    });
  } catch (error) {
    console.error('[Sync Participants] Error:', error);
    return NextResponse.json(
      { error: 'Failed to sync participants' },
      { status: 500 }
    );
  }
}
