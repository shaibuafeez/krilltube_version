import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch chat messages for a stream
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

    // Fetch messages from database
    const messages = await prisma.chatMessage.findMany({
      where: { streamId },
      orderBy: { createdAt: 'asc' },
      take: 100, // Limit to last 100 messages
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('[API Chat GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a new chat message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, userId, userName, message, donationAmount, txDigest } = body;

    if (!streamId || !userId || !userName || !message) {
      return NextResponse.json(
        { error: 'streamId, userId, userName, and message are required' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message is too long (max 500 characters)' },
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
        { error: 'You are banned from this chat' },
        { status: 403 }
      );
    }

    // Create message in database
    const chatMessage = await prisma.chatMessage.create({
      data: {
        streamId,
        userId,
        userName,
        message,
        donationAmount: donationAmount || null,
        txDigest: txDigest || null,
      },
    });

    // Note: Real-time message broadcasting is handled by LiveKit data channel in the client

    return NextResponse.json({ message: chatMessage });
  } catch (error) {
    console.error('[API Chat POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
