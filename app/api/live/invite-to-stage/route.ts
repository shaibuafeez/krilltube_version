import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST - Invite a viewer to become a co-host (approve join request)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, requestId, userId, inviterId } = body;

    if (!streamId || !userId || !inviterId) {
      return NextResponse.json(
        { error: 'streamId, userId, and inviterId are required' },
        { status: 400 }
      );
    }

    // Verify stream exists
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Verify inviter is the creator or a co-host with permissions
    if (stream.creatorId !== inviterId) {
      // Check if inviter is a co-host
      const inviterParticipant = await prisma.streamParticipant.findUnique({
        where: {
          streamId_userId: {
            streamId,
            userId: inviterId,
          },
        },
      });

      if (!inviterParticipant || inviterParticipant.role !== 'co-host') {
        return NextResponse.json(
          { error: 'Only the creator or co-hosts can invite to stage' },
          { status: 403 }
        );
      }
    }

    // Check current co-host count
    const coHostCount = await prisma.streamParticipant.count({
      where: {
        streamId,
        role: 'co-host',
      },
    });

    if (coHostCount >= stream.maxCoHosts) {
      return NextResponse.json(
        { error: `Maximum co-hosts reached (${stream.maxCoHosts})` },
        { status: 400 }
      );
    }

    // Update join request to approved if requestId provided
    if (requestId) {
      await prisma.streamJoinRequest.update({
        where: { id: requestId },
        data: {
          status: 'approved',
          respondedAt: new Date(),
          respondedBy: inviterId,
        },
      });
    }

    // Update participant to co-host with publish permissions
    const participant = await prisma.streamParticipant.update({
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
        handRaised: false, // Clear hand raised state
      },
    });

    return NextResponse.json({
      success: true,
      participant,
      message: 'User invited to stage successfully'
    });
  } catch (error) {
    console.error('[API Invite To Stage POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to invite to stage' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a co-host from stage
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, userId, removedBy } = body;

    if (!streamId || !userId) {
      return NextResponse.json(
        { error: 'streamId and userId are required' },
        { status: 400 }
      );
    }

    // Verify stream exists
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Verify remover is the creator or the user themselves
    if (removedBy && stream.creatorId !== removedBy && removedBy !== userId) {
      return NextResponse.json(
        { error: 'Only the creator or the participant can remove from stage' },
        { status: 403 }
      );
    }

    // Cannot remove the creator
    if (stream.creatorId === userId) {
      return NextResponse.json(
        { error: 'Cannot remove the stream creator from stage' },
        { status: 400 }
      );
    }

    // Update participant back to viewer
    await prisma.streamParticipant.update({
      where: {
        streamId_userId: {
          streamId,
          userId,
        },
      },
      data: {
        role: 'viewer',
        invitedToStage: false,
        handRaised: false,
        canPublish: false,
        canPublishScreen: false,
        isScreenSharing: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User removed from stage successfully'
    });
  } catch (error) {
    console.error('[API Invite To Stage DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from stage' },
      { status: 500 }
    );
  }
}
