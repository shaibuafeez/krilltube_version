import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// GET - Fetch all participants for a stream
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');
    const role = searchParams.get('role'); // Optional filter by role

    if (!streamId) {
      return NextResponse.json(
        { error: 'streamId is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      streamId,
      leftAt: null, // Only active participants
    };

    if (role) {
      where.role = role;
    }

    // Fetch participants
    const participants = await prisma.streamParticipant.findMany({
      where,
      orderBy: [
        { role: 'asc' }, // Creator/co-hosts first
        { joinedAt: 'asc' }, // Then by join time
      ],
    });

    // Count by role
    const counts = {
      total: participants.length,
      creator: participants.filter(p => p.role === 'creator').length,
      coHosts: participants.filter(p => p.role === 'co-host').length,
      viewers: participants.filter(p => p.role === 'viewer').length,
    };

    return NextResponse.json({
      participants,
      counts,
    });
  } catch (error) {
    console.error('[API Participants GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}
