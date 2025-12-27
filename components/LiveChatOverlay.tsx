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
  const [isChatVisible, setIsChatVisible] = useState(true);

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsChatVisible(!isChatVisible)}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-black/70 backdrop-blur-sm
          rounded-full text-white font-bold font-['Outfit'] text-sm
          border-2 border-white
          hover:bg-black/90 transition-all
          shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]"
      >
        {isChatVisible ? '💬 Hide Chat' : '💬 Show Chat'}
      </button>

      {/* Chat Overlay - TikTok Live Style */}
      {isChatVisible && (
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
      )}
    </>
  );
}
