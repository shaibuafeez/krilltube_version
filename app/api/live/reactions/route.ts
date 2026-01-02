/**
 * GET /api/live/reactions
 * Fetch recent emoji reactions for a stream
 *
 * POST /api/live/reactions
 * Send a new emoji reaction
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// In-memory store for reactions (temporary, real-time only)
// In production, consider using Redis or similar for distributed systems
interface Reaction {
  id: string;
  streamId: string;
  userId: string;
  emoji: string;
  timestamp: number;
}

const reactions: Reaction[] = [];
const REACTION_TTL = 5000; // Keep reactions for 5 seconds

// Clean up old reactions periodically
setInterval(() => {
  const now = Date.now();
  const validReactions = reactions.filter(r => now - r.timestamp < REACTION_TTL);
  reactions.length = 0;
  reactions.push(...validReactions);
}, 1000);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');
    const since = parseInt(searchParams.get('since') || '0');

    if (!streamId) {
      return NextResponse.json(
        { error: 'streamId is required' },
        { status: 400 }
      );
    }

    // Get reactions for this stream since timestamp
    const streamReactions = reactions.filter(
      r => r.streamId === streamId && r.timestamp > since
    );

    return NextResponse.json({
      reactions: streamReactions,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[API Reactions GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, userId, emoji } = body;

    // Validate required fields
    if (!streamId || !userId || !emoji) {
      return NextResponse.json(
        { error: 'streamId, userId, and emoji are required' },
        { status: 400 }
      );
    }

    // Validate emoji (basic check)
    if (typeof emoji !== 'string' || emoji.length > 10) {
      return NextResponse.json(
        { error: 'Invalid emoji' },
        { status: 400 }
      );
    }

    // Create new reaction
    const reaction: Reaction = {
      id: `${userId}-${Date.now()}-${Math.random()}`,
      streamId,
      userId,
      emoji,
      timestamp: Date.now(),
    };

    // Add to in-memory store
    reactions.push(reaction);

    console.log('[API Reactions POST] Reaction added:', reaction.emoji, 'by', userId.slice(0, 8));

    return NextResponse.json({
      success: true,
      reaction,
    });
  } catch (error) {
    console.error('[API Reactions POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send reaction' },
      { status: 500 }
    );
  }
}
