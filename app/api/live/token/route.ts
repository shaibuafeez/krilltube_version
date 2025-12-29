/**
 * POST /api/live/token
 *
 * Generates LiveKit access token for joining a room:
 * - Creator: Broadcaster token (publish + subscribe)
 * - Viewer: Viewer token (subscribe only)
 *
 * Also tracks viewer join in database (StreamViewer model)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateBroadcasterToken, generateViewerToken } from '@/lib/livekit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomName, userId, role = 'viewer', userName } = body;

    // Validate required fields
    if (!roomName || !userId) {
      return NextResponse.json(
        { error: 'roomName and userId are required' },
        { status: 400 }
      );
    }

    // Check if stream exists and is live
    const liveStream = await prisma.liveStream.findUnique({
      where: { roomName },
    });

    if (!liveStream) {
      return NextResponse.json(
        { error: 'Live stream not found' },
        { status: 404 }
      );
    }

    // Generate token based on role
    let token: string;

    if (role === 'broadcaster' && userId === liveStream.creatorId) {
      // Creator gets broadcaster token
      token = await generateBroadcasterToken(roomName, userId, userName || liveStream.title);

      // Update stream status to "live" when broadcaster joins
      if (liveStream.status === 'scheduled') {
        await prisma.liveStream.update({
          where: { id: liveStream.id },
          data: {
            status: 'live',
            startedAt: new Date(),
          },
        });
      }
    } else if (role === 'co-host') {
      // Co-hosts get broadcaster token (can publish video/audio)
      token = await generateBroadcasterToken(roomName, userId, userName || `CoHost-${userId.slice(0, 8)}`);

      console.log('[API Token] Generated co-host token for', userId);

      // Create/update participant record for co-host
      await prisma.streamParticipant.upsert({
        where: {
          streamId_userId: {
            streamId: liveStream.id,
            userId: userId,
          },
        },
        create: {
          streamId: liveStream.id,
          userId: userId,
          userName: userName || `CoHost-${userId.slice(0, 8)}`,
          role: 'co-host',
          canPublish: true,
          canPublishScreen: true,
        },
        update: {
          userName: userName || `CoHost-${userId.slice(0, 8)}`,
          role: 'co-host',
          canPublish: true,
          canPublishScreen: true,
          leftAt: null,
        },
      });
    } else {
      // Viewers get viewer token
      token = await generateViewerToken(roomName, userId, userName || `Viewer-${userId.slice(0, 8)}`);

      // Track viewer join
      await prisma.streamViewer.create({
        data: {
          streamId: liveStream.id,
          viewerAddress: userId,
        },
      });

      // Create/update participant record for viewer
      await prisma.streamParticipant.upsert({
        where: {
          streamId_userId: {
            streamId: liveStream.id,
            userId: userId,
          },
        },
        create: {
          streamId: liveStream.id,
          userId: userId,
          userName: userName || `Viewer-${userId.slice(0, 8)}`,
          role: 'viewer',
          canPublish: false,
          canPublishScreen: false,
        },
        update: {
          userName: userName || `Viewer-${userId.slice(0, 8)}`,
          leftAt: null, // Mark as active again if rejoining
        },
      });
    }

    console.log('[API Token] Generated token for', userId, 'as', role, 'in room', roomName);
    console.log('[API Token] Token type:', typeof token);
    console.log('[API Token] Token value:', token);
    console.log('[API Token] Token length:', token?.length);

    return NextResponse.json({
      success: true,
      token,
      livekitUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880',
      stream: {
        id: liveStream.id,
        title: liveStream.title,
        description: liveStream.description,
        status: liveStream.status,
        creatorId: liveStream.creatorId,
        allowParticipation: liveStream.allowParticipation,
        maxCoHosts: liveStream.maxCoHosts,
        requireApproval: liveStream.requireApproval,
      },
    });
  } catch (error) {
    console.error('[API Token] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate access token' },
      { status: 500 }
    );
  }
}
