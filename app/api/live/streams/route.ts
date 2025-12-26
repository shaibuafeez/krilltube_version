import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/live/streams
 *
 * Fetches live streams based on status filter
 * Query params:
 *   - status: 'live' | 'scheduled' | 'ended' (default: 'live')
 *   - limit: number of streams to return (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || 'live') as 'live' | 'scheduled' | 'ended';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    console.log('[LiveStreams] Fetching streams:', { status, limit });

    const streams = await prisma.liveStream.findMany({
      where: {
        status,
      },
      orderBy: [
        { startedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      include: {
        _count: {
          select: {
            viewers: true,
          },
        },
      },
    });

    // Format response
    const formattedStreams = streams.map((stream) => ({
      id: stream.id,
      roomName: stream.roomName,
      title: stream.title,
      description: stream.description,
      status: stream.status,
      creatorId: stream.creatorId,
      viewerCount: stream._count.viewers,
      startedAt: stream.startedAt?.toISOString(),
      endedAt: stream.endedAt?.toISOString(),
      createdAt: stream.createdAt.toISOString(),
    }));

    console.log('[LiveStreams] Found streams:', formattedStreams.length);

    return NextResponse.json({
      success: true,
      streams: formattedStreams,
      count: formattedStreams.length,
    });
  } catch (error) {
    console.error('[LiveStreams] Error fetching streams:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch live streams',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
