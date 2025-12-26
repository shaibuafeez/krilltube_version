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
