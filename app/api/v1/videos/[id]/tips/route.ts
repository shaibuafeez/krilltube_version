import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Record a tip
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    const body = await request.json();

    const { tipperAddress, tipperName, amount, message, txDigest, chain } = body;

    if (!tipperAddress || !amount || !txDigest) {
      return NextResponse.json(
        { error: 'tipperAddress, amount, and txDigest are required' },
        { status: 400 }
      );
    }

    // Verify video exists
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const tip = await prisma.videoTip.create({
      data: {
        videoId,
        tipperAddress,
        tipperName: tipperName || null,
        amount: String(amount),
        message: message || null,
        txDigest,
        chain: chain || 'sui',
      },
    });

    return NextResponse.json({ success: true, tip });
  } catch (error) {
    console.error('[API Tips] Error creating tip:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record tip' },
      { status: 500 }
    );
  }
}

// Fetch tips for a video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

    const tips = await prisma.videoTip.findMany({
      where: { videoId },
      orderBy: [{ amount: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });

    const totalTips = tips.reduce(
      (sum, tip) => sum + BigInt(tip.amount),
      BigInt(0)
    );

    return NextResponse.json({
      tips,
      totalTips: totalTips.toString(),
      count: tips.length,
    });
  } catch (error) {
    console.error('[API Tips] Error fetching tips:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tips' },
      { status: 500 }
    );
  }
}
