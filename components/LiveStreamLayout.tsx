'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useDataChannel,
} from '@livekit/components-react';
import { Track, DataPacket_Kind } from 'livekit-client';
import { ChatBox } from './ChatBox';
import '@livekit/components-styles';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  type: 'normal' | 'super_chat' | 'system';
  donationAmount?: string;
  isDeleted: boolean;
  deletedBy?: string;
  createdAt: string;
}

interface LiveStreamLayoutProps {
  token: string;
  serverUrl: string;
  streamId: string;
  streamInfo: {
    id: string;
    title: string;
    description?: string;
    creatorId: string;
  };
  userId: string;
  userName: string;
  userAvatar?: string;
  isBroadcaster?: boolean;
  isModerator?: boolean;
  onEndStream?: () => void;
}

// Chat component inside LiveKit room context
function LiveChat({
  streamId,
  userId,
  userName,
  userAvatar,
  isModerator,
}: {
  streamId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isModerator: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // LiveKit data channel for real-time messages
  const { send } = useDataChannel('chat', (message) => {
    // Receive messages from data channel
    const decoder = new TextDecoder();
    const data = JSON.parse(decoder.decode(message.payload));

    if (data.type === 'chat_message') {
      setMessages((prev) => [...prev, data.message]);
    } else if (data.type === 'message_deleted') {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, isDeleted: true, deletedBy: data.deletedBy, deletedAt: new Date().toISOString() }
            : msg
        )
      );
    }
  });

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/live/chat?streamId=${streamId}&limit=50&userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('[LiveChat] Failed to load history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [streamId, userId]);

  // Send message via API + broadcast via data channel
  const handleSendMessage = useCallback(
    async (message: string) => {
      try {
        // Save to database
        const response = await fetch('/api/live/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streamId,
            userId,
            userName,
            userAvatar,
            message,
            type: 'normal',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to send message');
        }

        const data = await response.json();
        const newMessage = data.message;

        // Broadcast via data channel to all participants
        const encoder = new TextEncoder();
        const payload = encoder.encode(
          JSON.stringify({
            type: 'chat_message',
            message: newMessage,
          })
        );

        send(payload, { reliable: true, destinationIdentities: [] }); // Broadcast to all

        // Add to local state
        setMessages((prev) => [...prev, newMessage]);
      } catch (error: any) {
        console.error('[LiveChat] Failed to send message:', error);
        alert(error.message || 'Failed to send message');
      }
    },
    [streamId, userId, userName, userAvatar, send]
  );

  // Delete message via API + broadcast deletion via data channel
  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      try {
        // Delete from database
        const response = await fetch('/api/live/chat', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageId,
            streamId,
            userId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete message');
        }

        // Broadcast deletion via data channel
        const encoder = new TextEncoder();
        const payload = encoder.encode(
          JSON.stringify({
            type: 'message_deleted',
            messageId,
            deletedBy: userId,
          })
        );

        send(payload, { reliable: true, destinationIdentities: [] });

        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, isDeleted: true, deletedBy: userId, deletedAt: new Date().toISOString() }
              : msg
          )
        );
      } catch (error) {
        console.error('[LiveChat] Failed to delete message:', error);
      }
    },
    [streamId, userId, send]
  );

  return (
    <ChatBox
      streamId={streamId}
      userId={userId}
      userName={userName}
      userAvatar={userAvatar}
      isModerator={isModerator}
      messages={messages}
      isLoading={isLoadingHistory}
      onSendMessage={handleSendMessage}
      onDeleteMessage={handleDeleteMessage}
    />
  );
}

// Video display component
function VideoDisplay({ isBroadcaster }: { isBroadcaster: boolean }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: !isBroadcaster }
  );

  return (
    <div className="flex-1 bg-black rounded-2xl overflow-hidden
      shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
      border-[3px] border-black">
      <GridLayout tracks={tracks} style={{ height: '100%' }}>
        <ParticipantTile />
      </GridLayout>
      <RoomAudioRenderer />
      <ControlBar variation="minimal" />
    </div>
  );
}

export function LiveStreamLayout({
  token,
  serverUrl,
  streamId,
  streamInfo,
  userId,
  userName,
  userAvatar,
  isBroadcaster = false,
  isModerator = false,
  onEndStream,
}: LiveStreamLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0668A6] to-[#1AAACE] p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1.5 bg-red-600 text-white text-sm font-bold rounded-full
                border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                🔴 LIVE
              </span>
              <h1 className="text-2xl font-bold text-white font-['Outfit']">
                {streamInfo.title}
              </h1>
            </div>
            {streamInfo.description && (
              <p className="text-white/80 font-['Outfit']">
                {streamInfo.description}
              </p>
            )}
            {!isBroadcaster && (
              <div className="flex items-center gap-2 text-sm text-white/70 font-['Outfit'] mt-2">
                <span>👤 Hosted by {streamInfo.creatorId.slice(0, 8)}...</span>
              </div>
            )}
          </div>

          {isBroadcaster && onEndStream && (
            <button
              onClick={onEndStream}
              className="px-6 py-3 bg-red-600 rounded-[32px] text-white font-bold font-['Outfit']
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                outline outline-2 outline-offset-[-2px] outline-black
                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                hover:translate-x-[1px]
                hover:translate-y-[1px]
                transition-all">
              End Stream
            </button>
          )}
        </div>

        {/* Main Content - Video + Chat */}
        <LiveKitRoom
          video={isBroadcaster}
          audio={isBroadcaster}
          token={token}
          serverUrl={serverUrl}
          data-lk-theme="default"
        >
          <div className="flex gap-6 h-[calc(100vh-200px)]">
            {/* Video Area - 70% */}
            <div className="flex-[7]">
              <VideoDisplay isBroadcaster={isBroadcaster} />
            </div>

            {/* Chat Area - 30% */}
            <div className="flex-[3] min-w-[350px]">
              <LiveChat
                streamId={streamId}
                userId={userId}
                userName={userName}
                userAvatar={userAvatar}
                isModerator={isModerator}
              />
            </div>
          </div>
        </LiveKitRoom>

        {/* Tips */}
        <div className="mt-6 p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
          <p className="text-white text-sm font-['Outfit']">
            {isBroadcaster ? (
              <>
                💡 <strong>Tip:</strong> Make sure your camera and microphone are enabled. Your viewers can see and hear you now!
              </>
            ) : (
              <>
                💬 <strong>Welcome!</strong> Use the chat to interact with other viewers and the creator. Enjoying the stream? Consider supporting with a donation!
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
