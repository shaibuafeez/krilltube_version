'use client';

import { useState } from 'react';
import LiveChat from './LiveChat';

interface LiveChatOverlayProps {
  roomName: string;
  streamId: string;
  creatorAddress: string;
  isBroadcaster: boolean;
}

export default function LiveChatOverlay({
  roomName,
  streamId,
  creatorAddress,
  isBroadcaster,
}: LiveChatOverlayProps) {
  return (
    <>
      {/* Chat Overlay - TikTok Live Style */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full sm:w-[500px] h-[70%] max-h-[600px] p-4 pointer-events-auto">
          <LiveChat
            roomName={roomName}
            streamId={streamId}
            creatorAddress={creatorAddress}
            isBroadcaster={isBroadcaster}
          />
        </div>
      </div>
    </>
  );
}
