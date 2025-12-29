import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch stream details by ID or roomName
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const roomName = searchParams.get('roomName');

    if (!id && !roomName) {
      return NextResponse.json(
        { error: 'id or roomName is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {};
    if (id) where.id = id;
    if (roomName) where.roomName = roomName;

    const stream = await prisma.liveStream.findUnique({
      where,
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ stream });
  } catch (error) {
    console.error('[API Stream GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream' },
      { status: 500 }
    );
  }
}
