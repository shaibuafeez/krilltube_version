'use client';

import LiveChat from './LiveChat';

interface LiveChatOverlayProps {
  roomName: string;
  streamId: string;
  creatorAddress: string;
  isBroadcaster: boolean;
  onOpenGift?: () => void;
  onOpenReactions?: () => void;
  isChatOpen: boolean;
}

export default function LiveChatOverlay({
  roomName,
  streamId,
  creatorAddress,
  isBroadcaster,
  onOpenGift,
  onOpenReactions,
  isChatOpen,
}: LiveChatOverlayProps) {
  return (
    <>
      {/* Chat Panel - Zoom Style Side Panel */}
      <div
        className={`absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-[#1c1c1e] z-30 pointer-events-auto transition-transform duration-300 ease-in-out
          ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h3 className="text-white text-sm font-semibold font-['Outfit']">Chat</h3>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <LiveChat
              roomName={roomName}
              streamId={streamId}
              creatorAddress={creatorAddress}
              isBroadcaster={isBroadcaster}
              externalOpenDonation={onOpenGift}
              externalOpenReactions={onOpenReactions}
            />
          </div>
        </div>
      </div>
    </>
  );
}

