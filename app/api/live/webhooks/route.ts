/**
 * POST /api/live/webhooks
 *
 * Handles LiveKit webhook events:
 * - room_started: Update stream status to "live"
 * - room_finished: Update stream status to "ended", trigger VOD archival
 * - participant_joined: Track viewer joins
 * - participant_left: Track viewer leaves
 */

import { NextRequest, NextResponse } from 'next/server';
import { WebhookReceiver } from 'livekit-server-sdk';
import { prisma } from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY || 'devkey',
  process.env.LIVEKIT_API_SECRET || 'secret'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const authHeader = request.headers.get('Authorization');

    // Verify webhook signature
    const event = await receiver.receive(body, authHeader || '');

    console.log('[Webhooks] Received event:', event.event, 'for room:', event.room?.name);

    const roomName = event.room?.name;
    if (!roomName) {
      return NextResponse.json({ error: 'No room name in event' }, { status: 400 });
    }

    // Find the LiveStream record
    const liveStream = await prisma.liveStream.findUnique({
      where: { roomName },
    });

    if (!liveStream) {
      console.warn('[Webhooks] Stream not found for room:', roomName);
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    // Handle different event types
    switch (event.event) {
      case 'room_started':
        // Update stream status to "live"
        await prisma.liveStream.update({
          where: { id: liveStream.id },
          data: {
            status: 'live',
            startedAt: new Date(),
          },
        });
        console.log('[Webhooks] Stream started:', liveStream.id);
        break;

      case 'room_finished':
        // Update stream status to "ended"
        await prisma.liveStream.update({
          where: { id: liveStream.id },
          data: {
            status: 'ended',
            endedAt: new Date(),
          },
        });
        console.log('[Webhooks] Stream ended:', liveStream.id);

        // TODO: Trigger VOD archival process here
        // - Download recording from LiveKit Egress
        // - Process through upload pipeline
        // - Upload to Walrus storage
        // - Link Video record to LiveStream
        break;

      case 'participant_joined':
        // Track viewer join (if not the broadcaster)
        const joinedIdentity = event.participant?.identity;
        if (joinedIdentity && joinedIdentity !== liveStream.creatorId) {
          await prisma.streamViewer.create({
            data: {
              streamId: liveStream.id,
              viewerAddress: joinedIdentity,
            },
          });
          console.log('[Webhooks] Viewer joined:', joinedIdentity);
        }
        break;

      case 'participant_left':
        // Update viewer left timestamp
        const leftIdentity = event.participant?.identity;
        if (leftIdentity && leftIdentity !== liveStream.creatorId) {
          await prisma.streamViewer.updateMany({
            where: {
              streamId: liveStream.id,
              viewerAddress: leftIdentity,
              leftAt: null,
            },
            data: {
              leftAt: new Date(),
            },
          });
          console.log('[Webhooks] Viewer left:', leftIdentity);
        }
        break;

      default:
        console.log('[Webhooks] Unhandled event type:', event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhooks] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
