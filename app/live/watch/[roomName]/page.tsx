'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';
import LiveChatOverlay from '@/components/LiveChatOverlay';
import LiveStreamPlayer from '@/components/LiveStreamPlayer';
import ViewerParticipation from '@/components/ViewerParticipation';
import InvitationNotifications from '@/components/InvitationNotifications';
import CoHostControls from '@/components/CoHostControls';
import { Header } from '@/components/Header';

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
      <div className="min-h-screen bg-gradient-to-br from-[#0668A6] to-[#1AAACE] p-6 pt-24">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1.5 bg-red-600 text-white text-sm font-bold rounded-full
              border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse">
              🔴 LIVE
            </span>
            <h1 className="text-2xl font-bold text-white font-['Outfit']">
              {streamInfo?.title || 'Live Stream'}
            </h1>
          </div>
          {streamInfo?.description && (
            <p className="text-white/80 font-['Outfit'] mb-2">
              {streamInfo.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-white/70 font-['Outfit']">
            <span>👤 Hosted by {streamInfo?.creatorId?.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Live Stream Video with Overlay Chat */}
        <div className="relative">
          <div className="rounded-[32px] overflow-hidden
            shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
            outline outline-[3px] outline-offset-[-3px] outline-black
            bg-black h-[calc(100vh-200px)]">

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
              <LiveStreamPlayer isBroadcaster={userRole === 'co-host'} />

              {/* Co-host controls - Show when promoted */}
              {userRole === 'co-host' && currentAccount?.address && (
                <CoHostControls
                  streamId={streamInfo?.id || ''}
                  userId={currentAccount.address}
                />
              )}
            </LiveKitRoom>

            {/* Chat Overlay - Positioned over video like YouTube/TikTok Live */}
            <LiveChatOverlay
              roomName={roomName}
              streamId={streamInfo?.id || ''}
              creatorAddress={streamInfo?.creatorId || ''}
              isBroadcaster={false}
            />

            {/* Viewer Participation - Request to Join Stream */}
            <ViewerParticipation
              streamId={streamInfo?.id || ''}
              roomName={roomName}
              allowParticipation={streamInfo?.allowParticipation || false}
              isBroadcaster={false}
            />

            {/* Invitation Notifications - Inside video screen */}
            <InvitationNotifications />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
