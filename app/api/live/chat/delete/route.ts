import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST - Delete a chat message (moderator/broadcaster only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, deletedBy } = body;

    if (!messageId || !deletedBy) {
      return NextResponse.json(
        { error: 'messageId and deletedBy are required' },
        { status: 400 }
      );
    }

    // Fetch the message to get the streamId
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: { stream: true },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if user is broadcaster or moderator
    const isBroadcaster = message.stream.creatorId === deletedBy;
    const isModerator = await prisma.streamModerator.findFirst({
      where: {
        streamId: message.streamId,
        moderatorAddress: deletedBy,
      },
    });

    if (!isBroadcaster && !isModerator) {
      return NextResponse.json(
        { error: 'Only broadcasters and moderators can delete messages' },
        { status: 403 }
      );
    }

    // Mark message as deleted
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        deleted: true,
        deletedBy,
        deletedAt: new Date(),
      },
    });

    // Note: Deletion event is broadcast via LiveKit data channel in the client

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Chat Delete] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
