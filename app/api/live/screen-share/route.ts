import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// POST - Update screen sharing status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, userId, isSharing } = body;

    if (!streamId || !userId || typeof isSharing !== 'boolean') {
      return NextResponse.json(
        { error: 'streamId, userId, and isSharing are required' },
        { status: 400 }
      );
    }

    // Update participant metadata
    const participant = await prisma.streamParticipant.update({
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

    return NextResponse.json({
      success: true,
      participant,
      message: isSharing ? 'Screen sharing started' : 'Screen sharing stopped'
    });
  } catch (error) {
    console.error('[API Screen Share POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update screen share status' },
      { status: 500 }
    );
  }
}
