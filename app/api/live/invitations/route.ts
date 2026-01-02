import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// GET - Fetch invitations for a user (as inviter or invitee)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const streamId = searchParams.get('streamId');
    const asInviter = searchParams.get('asInviter') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {};

    if (streamId) {
      where.streamId = streamId;
    }

    if (asInviter) {
      where.inviterId = userId;
    } else {
      where.inviteeId = userId;
    }

    // Fetch invitations
    const invitations = await prisma.streamInvitation.findMany({
      where,
      include: {
        stream: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            scheduledAt: true,
            creatorId: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    console.log('[API Invitations GET] Where clause:', where);
    console.log('[API Invitations GET] Found', invitations.length, 'invitations');

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('[API Invitations GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

// POST - Send an invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, inviterId, inviteeId, inviteeName } = body;

    if (!streamId || !inviterId || !inviteeId || !inviteeName) {
      return NextResponse.json(
        { error: 'streamId, inviterId, inviteeId, and inviteeName are required' },
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

    // Verify inviter is the creator
    if (stream.creatorId !== inviterId) {
      return NextResponse.json(
        { error: 'Only the stream creator can send invitations' },
        { status: 403 }
      );
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.streamInvitation.findUnique({
      where: {
        streamId_inviteeId: {
          streamId,
          inviteeId,
        },
      },
    });

    if (existingInvitation) {
      if (existingInvitation.status === 'pending') {
        return NextResponse.json(
          { error: 'Invitation already sent to this user' },
          { status: 400 }
        );
      }

      // Update existing invitation to pending if it was previously rejected/expired
      const invitation = await prisma.streamInvitation.update({
        where: {
          streamId_inviteeId: {
            streamId,
            inviteeId,
          },
        },
        data: {
          status: 'pending',
          sentAt: new Date(),
          respondedAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        invitation,
        message: 'Invitation re-sent successfully',
      });
    }

    // Create new invitation
    const invitation = await prisma.streamInvitation.create({
      data: {
        streamId,
        inviterId,
        inviteeId,
        inviteeName,
        status: 'pending',
      },
    });

    console.log('[API Invitations POST] Created invitation:', invitation);

    return NextResponse.json({
      success: true,
      invitation,
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    console.error('[API Invitations POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

// PUT - Accept or reject an invitation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationId, userId, accept } = body;

    if (!invitationId || !userId || typeof accept !== 'boolean') {
      return NextResponse.json(
        { error: 'invitationId, userId, and accept are required' },
        { status: 400 }
      );
    }

    // Fetch invitation
    const invitation = await prisma.streamInvitation.findUnique({
      where: { id: invitationId },
      include: { stream: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Verify user is the invitee
    if (invitation.inviteeId !== userId) {
      return NextResponse.json(
        { error: 'You are not authorized to respond to this invitation' },
        { status: 403 }
      );
    }

    // Verify invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'This invitation has already been responded to' },
        { status: 400 }
      );
    }

    const newStatus = accept ? 'accepted' : 'rejected';

    // Update invitation status
    const updatedInvitation = await prisma.streamInvitation.update({
      where: { id: invitationId },
      data: {
        status: newStatus,
        respondedAt: new Date(),
      },
    });

    // If accepted, create or update participant as co-host
    if (accept) {
      await prisma.streamParticipant.upsert({
        where: {
          streamId_userId: {
            streamId: invitation.streamId,
            userId: invitation.inviteeId,
          },
        },
        create: {
          streamId: invitation.streamId,
          userId: invitation.inviteeId,
          userName: invitation.inviteeName,
          role: 'co-host',
          invitedToStage: true,
          canPublish: true,
          canPublishScreen: true,
        },
        update: {
          role: 'co-host',
          invitedToStage: true,
          canPublish: true,
          canPublishScreen: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      invitation: updatedInvitation,
      message: accept
        ? 'Invitation accepted successfully'
        : 'Invitation rejected successfully',
    });
  } catch (error) {
    console.error('[API Invitations PUT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to respond to invitation' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel an invitation (by inviter)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationId, userId } = body;

    if (!invitationId || !userId) {
      return NextResponse.json(
        { error: 'invitationId and userId are required' },
        { status: 400 }
      );
    }

    // Fetch invitation
    const invitation = await prisma.streamInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Verify user is the inviter
    if (invitation.inviterId !== userId) {
      return NextResponse.json(
        { error: 'Only the inviter can cancel this invitation' },
        { status: 403 }
      );
    }

    // Update invitation to expired
    await prisma.streamInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'expired',
        respondedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully',
    });
  } catch (error) {
    console.error('[API Invitations DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel invitation' },
      { status: 500 }
    );
  }
}
