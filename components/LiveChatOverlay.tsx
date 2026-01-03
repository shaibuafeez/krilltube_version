'use client';

import LiveChat from './LiveChat';

interface LiveChatOverlayProps {
  roomName: string;
  streamId: string;
  creatorAddress: string;
  isBroadcaster: boolean;
  onOpenGift?: () => void;
  isChatOpen: boolean;
}

export default function LiveChatOverlay({
  roomName,
  streamId,
  creatorAddress,
  isBroadcaster,
  onOpenGift,
  isChatOpen,
}: LiveChatOverlayProps) {
  return (
    <div className="h-full bg-[#1c1c1e] flex flex-col">
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
        />
      </div>
    </div>
  );
}

