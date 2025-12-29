import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST - Raise hand (viewer requests to join stream)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, userId, userName, message } = body;

    if (!streamId || !userId || !userName) {
      return NextResponse.json(
        { error: 'streamId, userId, and userName are required' },
        { status: 400 }
      );
    }

    // Check if stream exists and allows participation
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    if (!stream.allowParticipation) {
      return NextResponse.json(
        { error: 'This stream does not allow viewer participation' },
        { status: 403 }
      );
    }

    // Check if user is the creator (creators don't need to raise hand)
    if (stream.creatorId === userId) {
      return NextResponse.json(
        { error: 'Stream creator does not need to raise hand' },
        { status: 400 }
      );
    }

    // Check if user is banned
    const activeBan = await prisma.streamBan.findFirst({
      where: {
        streamId,
        bannedAddress: userId,
        OR: [
          { expiresAt: null }, // Permanent ban
          { expiresAt: { gt: new Date() } }, // Temporary ban not expired
        ],
      },
    });

    if (activeBan) {
      return NextResponse.json(
        { error: 'You are banned from this stream' },
        { status: 403 }
      );
    }

    // Check if already has pending request
    const existingRequest = await prisma.streamJoinRequest.findFirst({
      where: {
        streamId,
        requesterId: userId,
        status: 'pending',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request' },
        { status: 400 }
      );
    }

    // Check if already a co-host
    const existingParticipant = await prisma.streamParticipant.findUnique({
      where: {
        streamId_userId: {
          streamId,
          userId,
        },
      },
    });

    if (existingParticipant && existingParticipant.role === 'co-host') {
      return NextResponse.json(
        { error: 'You are already a co-host' },
        { status: 400 }
      );
    }

    // Create join request
    const joinRequest = await prisma.streamJoinRequest.create({
      data: {
        streamId,
        requesterId: userId,
        requesterName: userName,
        message: message || null,
        status: 'pending',
      },
    });

    // Update or create participant metadata with hand raised
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
        canPublish: false,
        canPublishScreen: false,
      },
      update: {
        handRaised: true,
      },
    });

    return NextResponse.json({
      success: true,
      joinRequest,
      message: 'Request sent successfully'
    });
  } catch (error) {
    console.error('[API Raise Hand POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to raise hand' },
      { status: 500 }
    );
  }
}

// DELETE - Lower hand (cancel request)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, userId } = body;

    if (!streamId || !userId) {
      return NextResponse.json(
        { error: 'streamId and userId are required' },
        { status: 400 }
      );
    }

    // Update pending join requests to rejected
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

    return NextResponse.json({
      success: true,
      message: 'Request cancelled successfully'
    });
  } catch (error) {
    console.error('[API Raise Hand DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to lower hand' },
      { status: 500 }
    );
  }
}
