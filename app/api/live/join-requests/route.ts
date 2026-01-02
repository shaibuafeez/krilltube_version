import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// GET - Fetch pending join requests for a stream
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');

    if (!streamId) {
      return NextResponse.json(
        { error: 'streamId is required' },
        { status: 400 }
      );
    }

    // Fetch pending join requests
    const requests = await prisma.streamJoinRequest.findMany({
      where: {
        streamId,
        status: 'pending',
      },
      orderBy: {
        requestedAt: 'asc', // Oldest first (FIFO)
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('[API Join Requests GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch join requests' },
      { status: 500 }
    );
  }
}

// DELETE - Reject a join request
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, streamId, rejectedBy } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: 'requestId is required' },
        { status: 400 }
      );
    }

    // Fetch the request first
    const joinRequest = await prisma.streamJoinRequest.findUnique({
      where: { id: requestId },
    });

    if (!joinRequest) {
      return NextResponse.json(
        { error: 'Join request not found' },
        { status: 404 }
      );
    }

    // Verify stream exists
    const stream = await prisma.liveStream.findUnique({
      where: { id: joinRequest.streamId },
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Verify rejectedBy is the creator (if provided)
    if (rejectedBy && stream.creatorId !== rejectedBy) {
      return NextResponse.json(
        { error: 'Only the creator can reject requests' },
        { status: 403 }
      );
    }

    // Update request to rejected
    await prisma.streamJoinRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        respondedAt: new Date(),
        respondedBy: rejectedBy || stream.creatorId,
      },
    });

    // Update participant metadata to lower hand
    await prisma.streamParticipant.updateMany({
      where: {
        streamId: joinRequest.streamId,
        userId: joinRequest.requesterId,
      },
      data: {
        handRaised: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Join request rejected successfully'
    });
  } catch (error) {
    console.error('[API Join Requests DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to reject join request' },
      { status: 500 }
    );
  }
}
