'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { LiveKitRoom, useParticipants } from '@livekit/components-react';
import LiveChatOverlay from '@/components/LiveChatOverlay';
import LiveStreamPlayer from '@/components/LiveStreamPlayer';
import ParticipantManagementPanel from '@/components/ParticipantManagementPanel';
import InvitationNotifications from '@/components/InvitationNotifications';
import CoHostControls from '@/components/CoHostControls';
import EmojiReactions from '@/components/EmojiReactions';
import { Header } from '@/components/Header';
import MobileStreamMenu from '@/components/MobileStreamMenu';
import MeetStyleControls from '@/components/MeetStyleControls';

// Wrapper component to access LiveKit context
function BroadcastContent({
  streamInfo,
  currentAccount,
  roomName,
  handleEndStream,
}: {
  streamInfo: any;
  currentAccount: any;
  roomName: string;
  handleEndStream: () => void;
}) {
  const participants = useParticipants();
  const viewerCount = participants.length;

  console.log('[Broadcast] Participants:', participants.length, 'Viewer count:', viewerCount);

  return (
    <>
      {/* Mobile Hamburger Menu - Only on mobile */}
      <MobileStreamMenu
        streamTitle={streamInfo?.title}
        streamDescription={streamInfo?.description}
        viewerCount={viewerCount}
        isLive={true}
        isBroadcaster={true}
        onEndStream={handleEndStream}
      />

      <LiveStreamPlayer isBroadcaster={true} />

      {/* Google Meet Style Controls - Bottom center */}
      <MeetStyleControls
        onLeave={handleEndStream}
        isBroadcaster={true}
      />

      {/* Chat Overlay - Positioned over video like YouTube/TikTok Live */}
      <LiveChatOverlay
        roomName={roomName}
        streamId={streamInfo?.id || ''}
        creatorAddress={streamInfo?.creatorId || ''}
        isBroadcaster={true}
      />

      {/* Invitation Notifications - Inside video screen */}
      <InvitationNotifications />

      {/* Emoji Reactions - Floating animations */}
      <EmojiReactions
        streamId={streamInfo?.id || ''}
        roomName={roomName}
      />
    </>
  );
}

export default function BroadcastPage() {
  const params = useParams();
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const roomName = params.roomName as string;

  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [streamInfo, setStreamInfo] = useState<any>(null);

  useEffect(() => {
    if (!currentAccount?.address || !roomName) {
      return;
    }

    // Fetch broadcaster token
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/live/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName,
            userId: currentAccount.address,
            role: 'broadcaster',
            userName: `Broadcaster-${currentAccount.address.slice(0, 8)}`,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get broadcaster token');
        }

        const data = await response.json();
        console.log('[Broadcast] Token response:', data);
        console.log('[Broadcast] Token type:', typeof data.token);
        console.log('[Broadcast] Token value:', data.token);
        setToken(data.token);
        setStreamInfo(data.stream);
        setIsLoading(false);
      } catch (err: any) {
        console.error('[Broadcast] Error fetching token:', err);
        setError(err.message || 'Failed to join stream');
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [currentAccount?.address, roomName]);

  const handleEndStream = () => {
    if (confirm('Are you sure you want to end the stream?')) {
      // LiveKit room will automatically close when we navigate away
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0668A6] to-[#1AAACE] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white text-xl font-bold font-['Outfit']">
            Connecting to stream...
          </p>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0668A6] to-[#1AAACE] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 bg-white rounded-[32px]
          shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
          outline outline-[3px] outline-offset-[-3px] outline-black">
          <h2 className="text-2xl font-bold text-black mb-4 font-['Outfit']">
            ⚠️ Error
          </h2>
          <p className="text-black/80 mb-6 font-['Outfit']">
            {error || 'Failed to connect to stream. Please try again.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-[#0668A6] rounded-[32px] text-white font-bold font-['Outfit']
              shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
              outline outline-2 outline-offset-[-2px] outline-black
              hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
              hover:translate-x-[1px]
              hover:translate-y-[1px]
              transition-all">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        showHamburgerOnly={true}
        showParticipantManagement={true}
        participantManagementPanel={
          <ParticipantManagementPanel
            streamId={streamInfo?.id || ''}
            creatorId={streamInfo?.creatorId || ''}
            isBroadcaster={true}
          />
        }
      />
      <div className="min-h-screen bg-gradient-to-br from-[#0668A6] to-[#1AAACE] p-0 md:p-6 pt-0 md:pt-24">
        <div className="max-w-7xl mx-auto">
        {/* Header - Hide on mobile, compact on desktop */}
        <div className="mb-2 sm:mb-6 px-4 sm:px-0 hidden sm:flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1.5 bg-red-600 text-white text-sm font-bold rounded-full
                border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                🔴 LIVE
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                {streamInfo?.title || 'Live Broadcast'}
              </h1>
            </div>
            {streamInfo?.description && (
              <p className="text-white/80 font-['Outfit'] text-sm">
                {streamInfo.description}
              </p>
            )}
          </div>

          <button
            onClick={handleEndStream}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 rounded-[32px] text-white font-bold font-['Outfit'] text-sm sm:text-base
              shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
              outline outline-2 outline-offset-[-2px] outline-black
              hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
              hover:translate-x-[1px]
              hover:translate-y-[1px]
              transition-all">
            End Stream
          </button>
        </div>

        {/* Live Stream Video with Overlay Chat */}
        <div className="relative">
          <div className="sm:rounded-[32px] overflow-hidden
            sm:shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
            sm:outline sm:outline-[3px] sm:outline-offset-[-3px] sm:outline-black
            bg-black h-screen sm:h-[calc(100vh-200px)]">

            {/* Inner container to keep all absolute elements inside */}
            <div className="relative w-full h-full">
              <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                data-lk-theme="default"
                className="h-full"
              >
                <BroadcastContent
                  streamInfo={streamInfo}
                  currentAccount={currentAccount}
                  roomName={roomName}
                  handleEndStream={handleEndStream}
                />
              </LiveKitRoom>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
