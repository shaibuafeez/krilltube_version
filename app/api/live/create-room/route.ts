/**
 * POST /api/live/create-room
 *
 * Creates a new live stream room:
 * 1. Creates LiveKit room
 * 2. Creates LiveStream record in database
 * 3. Returns room details and broadcaster token
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createLivekitRoom, generateBroadcasterToken } from '@/lib/livekit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      creatorId,
      scheduledAt,
      maxParticipants = 100,
      allowParticipation = true,
      maxCoHosts = 5,
      requireApproval = true,
    } = body;

    // Validate required fields
    if (!title || !creatorId) {
      return NextResponse.json(
        { error: 'Title and creatorId are required' },
        { status: 400 }
      );
    }

    // Generate unique room name (creator ID + timestamp)
    const roomName = `live_${creatorId}_${Date.now()}`;

    // Create LiveKit room
    console.log('[API CreateRoom] Creating LiveKit room:', roomName);
    await createLivekitRoom(roomName, maxParticipants);

    // Create LiveStream record in database
    const liveStream = await prisma.liveStream.create({
      data: {
        roomName,
        title,
        description,
        creatorId,
        status: 'scheduled',
        maxParticipants,
        allowParticipation,
        maxCoHosts,
        requireApproval,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    // Create creator as first participant
    await prisma.streamParticipant.create({
      data: {
        streamId: liveStream.id,
        userId: creatorId,
        userName: `Creator-${creatorId.slice(0, 6)}`,
        role: 'creator',
        canPublish: true,
        canPublishScreen: true,
      },
    });

    console.log('[API CreateRoom] LiveStream created:', liveStream.id);

    // Generate broadcaster token for the creator
    const broadcasterToken = await generateBroadcasterToken(roomName, creatorId, title);

    return NextResponse.json({
      success: true,
      liveStream: {
        id: liveStream.id,
        roomName: liveStream.roomName,
        title: liveStream.title,
        description: liveStream.description,
        status: liveStream.status,
        createdAt: liveStream.createdAt,
      },
      broadcasterToken,
      livekitUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880',
    });
  } catch (error) {
    console.error('[API CreateRoom] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create live stream room' },
      { status: 500 }
    );
  }
}
