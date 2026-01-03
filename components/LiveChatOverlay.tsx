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
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Chat Toggle Button - Zoom Style */}
      <div className="absolute bottom-4 right-4 z-40 pointer-events-auto">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg
            ${isChatOpen
              ? 'bg-[#1a73e8] hover:bg-[#1765cc] text-white'
              : 'bg-[#3c4043] hover:bg-[#5f6368] text-white'
            }`}
          title={isChatOpen ? 'Close chat' : 'Open chat'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Chat Panel - Zoom Style Side Panel */}
      <div
        className={`absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-[#1c1c1e] z-30 pointer-events-auto transition-transform duration-300 ease-in-out
          ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h3 className="text-white text-sm font-semibold font-['Outfit']">Chat</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <LiveChat
              roomName={roomName}
              streamId={streamId}
              creatorAddress={creatorAddress}
              isBroadcaster={isBroadcaster}
            />
          </div>
        </div>
      </div>
    </>
  );
}
