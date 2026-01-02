import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// POST - Record a donation and create Super Chat message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, donorAddress, donorName, amount, message, txDigest } = body;

    if (!streamId || !donorAddress || !amount || !message || !txDigest) {
      return NextResponse.json(
        {
          error:
            'streamId, donorAddress, amount, message, and txDigest are required',
        },
        { status: 400 }
      );
    }

    // Validate amount
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    // Check if user is banned
    const activeBan = await prisma.streamBan.findFirst({
      where: {
        streamId,
        bannedAddress: donorAddress,
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

    // 1. Record the donation
    const donation = await prisma.streamDonation.create({
      data: {
        streamId,
        donorAddress,
        donorName: donorName || `User-${donorAddress.slice(0, 8)}`,
        amount,
        message,
        txDigest,
      },
    });

    // 2. Create a Super Chat message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        streamId,
        userId: donorAddress,
        userName: donorName || `User-${donorAddress.slice(0, 8)}`,
        message,
        donationAmount: amount,
        txDigest,
      },
    });

    return NextResponse.json({
      success: true,
      donation,
      chatMessage,
    });
  } catch (error) {
    console.error('[API Donation] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    );
  }
}
