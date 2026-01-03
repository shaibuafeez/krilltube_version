'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { LiveKitRoom, useParticipants } from '@livekit/components-react';
import LiveChatOverlay from '@/components/LiveChatOverlay';
import LiveStreamPlayer from '@/components/LiveStreamPlayer';
import ViewerParticipation from '@/components/ViewerParticipation';
import InvitationNotifications from '@/components/InvitationNotifications';
import EmojiReactions from '@/components/EmojiReactions';
import { Header } from '@/components/Header';
import MobileStreamMenu from '@/components/MobileStreamMenu';
import MeetStyleControls from '@/components/MeetStyleControls';
import EmojiReactionPicker from '@/components/EmojiReactionPicker';

// Wrapper component to access LiveKit context
function StreamContent({
  streamInfo,
  userRole,
  roomName,
  isChatOpen,
  setIsChatOpen,
  viewMode,
  setViewMode,
}: {
  streamInfo: any;
  userRole: 'viewer' | 'co-host';
  roomName: string;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  viewMode: 'speaker' | 'grid';
  setViewMode: (mode: 'speaker' | 'grid') => void;
}) {
  const participants = useParticipants();
  const viewerCount = participants.length;
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  console.log('[Watch] Participants:', participants.length, 'Viewer count:', viewerCount);

  const handleOpenGift = () => {
    if ((window as any).__openDonationModal) {
      (window as any).__openDonationModal();
    }
  };

  return (
    <>
      {/* Mobile Hamburger Menu - Only on mobile */}
      <MobileStreamMenu
        streamTitle={streamInfo?.title}
        streamDescription={streamInfo?.description}
        creatorId={streamInfo?.creatorId}
        viewerCount={viewerCount}
        isLive={true}
        isBroadcaster={false}
      />

      <LiveStreamPlayer
        isBroadcaster={userRole === 'co-host'}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Google Meet Style Controls - Show when promoted to co-host */}
      {userRole === 'co-host' && (
        <MeetStyleControls
          onLeave={() => window.location.href = '/'}
          isBroadcaster={false}
          onOpenGift={handleOpenGift}
          isChatOpen={isChatOpen}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          streamId={streamInfo?.id || ''}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
        />
      )}

      {/* Chat Toggle Button for Viewers (non-co-hosts) */}
      {userRole === 'viewer' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
          {/* Emoji Reaction Picker */}
          <EmojiReactionPicker
            streamId={streamInfo?.id || ''}
            isOpen={isEmojiPickerOpen}
            onClose={() => setIsEmojiPickerOpen(false)}
          />

          <div className="flex items-center gap-2 px-4 py-2 bg-[#202124] rounded-full shadow-lg border border-gray-700/50 relative">
            {/* Grid/Speaker View Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${viewMode === 'grid'
                  ? 'bg-[#1a73e8] hover:bg-[#1765cc] text-white'
                  : 'bg-[#3c4043] hover:bg-[#5f6368] text-white'
                }`}
              title={viewMode === 'grid' ? 'Switch to speaker view' : 'Switch to grid view'}
            >
              {viewMode === 'grid' ? (
                /* Speaker View Icon */
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                /* Grid View Icon */
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              )}
            </button>

            {/* Chat Toggle */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${isChatOpen
                  ? 'bg-[#1a73e8] hover:bg-[#1765cc] text-white'
                  : 'bg-[#3c4043] hover:bg-[#5f6368] text-white'
                }`}
              title={isChatOpen ? 'Close chat' : 'Open chat'}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            {/* Reactions Button */}
            <button
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${isEmojiPickerOpen
                  ? 'bg-[#1a73e8] hover:bg-[#1765cc] text-white'
                  : 'bg-[#3c4043] hover:bg-[#5f6368] text-white'
                }`}
              title="React with emoji"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Gift Button */}
            <button
              onClick={handleOpenGift}
              className="w-10 h-10 rounded-full bg-[#3c4043] hover:bg-[#5f6368] flex items-center justify-center transition-all text-white"
              title="Send Gift"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Viewer Participation - Request to Join Stream */}
      <ViewerParticipation
        streamId={streamInfo?.id || ''}
        roomName={roomName}
        allowParticipation={streamInfo?.allowParticipation || false}
        isBroadcaster={false}
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

export default function WatchStreamPage() {
  const params = useParams();
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const roomName = params.roomName as string;

  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [streamInfo, setStreamInfo] = useState<any>(null);
  const [userRole, setUserRole] = useState<'viewer' | 'co-host'>('viewer');
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'speaker' | 'grid'>('speaker');

  useEffect(() => {
    if (!currentAccount?.address || !roomName) {
      // Allow watching without wallet, use anonymous identity
      const anonymousId = `viewer-${Math.random().toString(36).substring(7)}`;
      fetchToken(anonymousId);
      return;
    }

    fetchToken(currentAccount.address);
  }, [currentAccount?.address, roomName]);

  const fetchToken = async (userId: string, role: 'viewer' | 'co-host' = 'viewer') => {
    try {
      console.log('[Watch] Fetching token for', userId, 'as', role);
      const response = await fetch('/api/live/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName,
          userId,
          role,
          userName: currentAccount?.address
            ? `User-${currentAccount.address.slice(0, 8)}`
            : `Anonymous-${userId.slice(0, 8)}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Stream not found or not available');
      }

      const data = await response.json();
      setToken(data.token);
      setStreamInfo(data.stream);
      setUserRole(role);
      setIsLoading(false);
      console.log('[Watch] Token fetched successfully, role:', role);
    } catch (err: any) {
      console.error('[Watch] Error fetching token:', err);
      setError(err.message || 'Failed to join stream');
      setIsLoading(false);
    }
  };

  // Poll for role changes - detect when user is promoted to co-host
  useEffect(() => {
    if (!currentAccount?.address || !streamInfo?.id) {
      return;
    }

    const checkRoleChange = async () => {
      try {
        const response = await fetch(
          `/api/live/participants?streamId=${streamInfo.id}&userId=${currentAccount.address}`
        );

        if (response.ok) {
          const data = await response.json();
          const participant = data.participants?.[0];

          if (participant && participant.role === 'co-host' && userRole === 'viewer') {
            console.log('[Watch] User promoted to co-host! Refreshing token...');
            setIsRefreshingToken(true);

            // Fetch new token with co-host permissions
            await fetchToken(currentAccount.address, 'co-host');

            setIsRefreshingToken(false);
            console.log('[Watch] Token refreshed successfully as co-host');
          }
        }
      } catch (err) {
        console.error('[Watch] Error checking role:', err);
      }
    };

    // Check immediately
    checkRoleChange();

    // Then poll every 3 seconds
    const interval = setInterval(checkRoleChange, 3000);

    return () => clearInterval(interval);
  }, [currentAccount?.address, streamInfo?.id, userRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0668A6] to-[#1AAACE] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white text-xl font-bold font-['Outfit']">
            Loading stream...
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
            ⚠️ Stream Not Available
          </h2>
          <p className="text-black/80 mb-6 font-['Outfit']">
            {error || 'This stream is not available. It may have ended or doesn\'t exist.'}
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
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header showHamburgerOnly={true} />
      <div className="min-h-screen bg-gradient-to-br from-[#0668A6] to-[#1AAACE] p-0 md:p-6 pt-0 md:pt-24">
        <div className="max-w-7xl mx-auto">
        {/* Header - Hide on mobile to save space */}
        <div className="mb-2 sm:mb-6 px-4 sm:px-0 hidden sm:block">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1.5 bg-red-600 text-white text-sm font-bold rounded-full
              border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse">
              🔴 LIVE
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              {streamInfo?.title || 'Live Stream'}
            </h1>
          </div>
          {streamInfo?.description && (
            <p className="text-white/80 font-['Outfit'] mb-2 text-sm">
              {streamInfo.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70 font-['Outfit']">
            <span>👤 Hosted by {streamInfo?.creatorId?.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Live Stream Video with Overlay Chat */}
        <div className="relative flex gap-0">
          {/* Video Container - Shrinks when chat is open */}
          <div className={`overflow-hidden
            sm:shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
            sm:outline sm:outline-[3px] sm:outline-offset-[-3px] sm:outline-black
            bg-black h-screen sm:h-[calc(100vh-200px)] transition-all duration-300
            ${isChatOpen ? 'w-full sm:w-[calc(100%-384px)] sm:rounded-l-[32px]' : 'w-full sm:rounded-[32px]'}`}>

            {/* Inner container to keep all absolute elements inside */}
            <div className="relative w-full h-full">
              {/* Token refresh loading overlay */}
              {isRefreshingToken && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-white text-lg font-bold font-['Outfit']">
                      Upgrading to Co-Host...
                    </p>
                    <p className="text-white/80 text-sm font-['Outfit']">
                      Reconnecting with new permissions
                    </p>
                  </div>
                </div>
              )}

              <LiveKitRoom
                key={token} // Force remount when token changes (co-host upgrade)
                video={userRole === 'co-host'} // Enable camera for co-hosts
                audio={userRole === 'co-host'} // Enable mic for co-hosts
                token={token}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                data-lk-theme="default"
                className="h-full"
              >
                <StreamContent
                  streamInfo={streamInfo}
                  userRole={userRole}
                  roomName={roomName}
                  isChatOpen={isChatOpen}
                  setIsChatOpen={setIsChatOpen}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              </LiveKitRoom>
            </div>
          </div>

          {/* Chat Panel - Fixed position on right */}
          <div className={`h-screen sm:h-[calc(100vh-200px)] sm:shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)] sm:outline sm:outline-[3px] sm:outline-offset-[-3px] sm:outline-black rounded-bl-[32px] sm:rounded-bl-none sm:rounded-r-[32px] ${isChatOpen ? 'w-full sm:w-96' : 'w-0'} transition-all duration-300 overflow-hidden`}>
            <LiveChatOverlay
              roomName={roomName}
              streamId={streamInfo?.id || ''}
              creatorAddress={streamInfo?.creatorId || ''}
              isBroadcaster={false}
              onOpenGift={(window as any).__openDonationModal}
              isChatOpen={isChatOpen}
            />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
