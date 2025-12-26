/**
 * Live Stream Chat API
 *
 * POST /api/live/chat - Send a chat message
 * GET /api/live/chat?streamId=xxx - Fetch chat messages
 * DELETE /api/live/chat - Delete a message (moderator only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST - Send a chat message
 *
 * Body:
 * - streamId: string
 * - userId: string (wallet address)
 * - userName: string
 * - userAvatar?: string
 * - message: string
 * - type?: "normal" | "super_chat" | "system"
 * - donationAmount?: string (for super_chat)
 * - txDigest?: string (for super_chat)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      streamId,
      userId,
      userName,
      userAvatar,
      message,
      type = 'normal',
      donationAmount,
      txDigest,
    } = body;

    // Validate required fields
    if (!streamId || !userId || !userName || !message) {
      return NextResponse.json(
        { error: 'streamId, userId, userName, and message are required' },
        { status: 400 }
      );
    }

    // Validate super_chat has donation info
    if (type === 'super_chat' && (!donationAmount || !txDigest)) {
      return NextResponse.json(
        { error: 'Super chat requires donationAmount and txDigest' },
        { status: 400 }
      );
    }

    // Check if stream exists
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
      include: {
        moderators: true,
      },
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Check if user is banned
    const ban = await prisma.bannedUser.findUnique({
      where: {
        streamId_userId: {
          streamId,
          userId,
        },
      },
    });

    if (ban) {
      // Check if ban is expired
      if (ban.expiresAt && ban.expiresAt < new Date()) {
        // Ban expired, delete it
        await prisma.bannedUser.delete({
          where: { id: ban.id },
        });
      } else {
        return NextResponse.json(
          { error: 'You are banned from this chat' },
          { status: 403 }
        );
      }
    }

    // Check slow mode (rate limiting)
    if (stream.slowMode > 0 && type !== 'super_chat') {
      // Get user's last message
      const lastMessage = await prisma.chatMessage.findFirst({
        where: {
          streamId,
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (lastMessage) {
        const timeSinceLastMessage = Date.now() - lastMessage.createdAt.getTime();
        const slowModeMs = stream.slowMode * 1000;

        if (timeSinceLastMessage < slowModeMs) {
          const waitTime = Math.ceil((slowModeMs - timeSinceLastMessage) / 1000);
          return NextResponse.json(
            { error: `Slow mode active. Wait ${waitTime}s before sending another message.` },
            { status: 429 }
          );
        }
      }
    }

    // Create chat message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        streamId,
        userId,
        userName,
        userAvatar,
        message,
        type,
        donationAmount,
        txDigest,
      },
    });

    console.log('[API Chat] Message sent:', chatMessage.id, 'by', userName);

    return NextResponse.json({
      success: true,
      message: chatMessage,
    });
  } catch (error) {
    console.error('[API Chat] Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

/**
 * GET - Fetch chat messages
 *
 * Query params:
 * - streamId: string (required)
 * - limit?: number (default 50, max 100)
 * - cursor?: string (message ID for pagination)
 * - userId?: string (check if user is moderator to show deleted messages)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const cursor = searchParams.get('cursor');
    const userId = searchParams.get('userId');

    if (!streamId) {
      return NextResponse.json(
        { error: 'streamId is required' },
        { status: 400 }
      );
    }

    // Check if user is moderator or creator
    let isModerator = false;
    if (userId) {
      const stream = await prisma.liveStream.findUnique({
        where: { id: streamId },
        include: {
          moderators: {
            where: { userId },
          },
        },
      });

      isModerator = stream?.creatorId === userId || (stream?.moderators.length ?? 0) > 0;
    }

    // Build query
    const where: any = { streamId };

    // Hide deleted messages for non-moderators
    if (!isModerator) {
      where.isDeleted = false;
    }

    // Pagination cursor
    if (cursor) {
      where.id = { lt: cursor }; // Get messages before this cursor
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Reverse to get chronological order
    const chronologicalMessages = messages.reverse();

    return NextResponse.json({
      success: true,
      messages: chronologicalMessages,
      hasMore: messages.length === limit,
      cursor: messages.length > 0 ? messages[messages.length - 1].id : null,
    });
  } catch (error) {
    console.error('[API Chat] Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a chat message (moderator only)
 *
 * Body:
 * - messageId: string
 * - streamId: string
 * - userId: string (moderator/creator making the deletion)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, streamId, userId } = body;

    if (!messageId || !streamId || !userId) {
      return NextResponse.json(
        { error: 'messageId, streamId, and userId are required' },
        { status: 400 }
      );
    }

    // Check if stream exists and user is moderator/creator
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
      include: {
        moderators: {
          where: { userId },
        },
      },
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    const isModerator = stream.creatorId === userId || stream.moderators.length > 0;

    if (!isModerator) {
      return NextResponse.json(
        { error: 'Only moderators can delete messages' },
        { status: 403 }
      );
    }

    // Soft delete the message
    const deletedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedBy: userId,
        deletedAt: new Date(),
      },
    });

    console.log('[API Chat] Message deleted:', messageId, 'by', userId);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
      deletedMessage,
    });
  } catch (error) {
    console.error('[API Chat] Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
