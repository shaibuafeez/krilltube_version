/**
 * LiveKit Server SDK Utilities
 *
 * Provides helper functions for:
 * - Creating LiveKit rooms
 * - Generating access tokens for broadcasters and viewers
 * - Managing room lifecycle
 */

import { RoomServiceClient, AccessToken, Room } from 'livekit-server-sdk';

// Initialize LiveKit API client
const livekitHost = process.env.LIVEKIT_URL || 'ws://localhost:7880';
const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';

// Create RoomServiceClient for managing rooms
export const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

/**
 * Create a new LiveKit room
 */
export async function createLivekitRoom(
  roomName: string,
  maxParticipants: number = 100
): Promise<Room> {
  try {
    const room = await roomService.createRoom({
      name: roomName,
      emptyTimeout: 300, // 5 minutes - keep room alive if empty
      maxParticipants,
    });

    console.log('[LiveKit] Room created:', roomName);
    return room;
  } catch (error) {
    console.error('[LiveKit] Failed to create room:', error);
    throw new Error('Failed to create LiveKit room');
  }
}

/**
 * Generate access token for a broadcaster (publisher)
 */
export function generateBroadcasterToken(
  roomName: string,
  identity: string,
  name?: string
): string {
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: name || identity,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return at.toJwt();
}

/**
 * Generate access token for a viewer (subscriber only)
 */
export function generateViewerToken(
  roomName: string,
  identity: string,
  name?: string
): string {
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: name || identity,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: false,
    canSubscribe: true,
    canPublishData: true, // Allow chat messages
  });

  return at.toJwt();
}

/**
 * Delete a LiveKit room
 */
export async function deleteLivekitRoom(roomName: string): Promise<void> {
  try {
    await roomService.deleteRoom(roomName);
    console.log('[LiveKit] Room deleted:', roomName);
  } catch (error) {
    console.error('[LiveKit] Failed to delete room:', error);
    throw new Error('Failed to delete LiveKit room');
  }
}

/**
 * List all participants in a room
 */
export async function listRoomParticipants(roomName: string) {
  try {
    const participants = await roomService.listParticipants(roomName);
    return participants;
  } catch (error) {
    console.error('[LiveKit] Failed to list participants:', error);
    return [];
  }
}

/**
 * Get room info
 */
export async function getRoomInfo(roomName: string): Promise<Room | null> {
  try {
    const rooms = await roomService.listRooms([roomName]);
    return rooms.length > 0 ? rooms[0] : null;
  } catch (error) {
    console.error('[LiveKit] Failed to get room info:', error);
    return null;
  }
}
