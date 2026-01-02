'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface ViewerParticipationProps {
  streamId: string;
  roomName: string;
  allowParticipation: boolean;
  isBroadcaster: boolean;
}

export default function ViewerParticipation({
  streamId,
  roomName,
  allowParticipation,
  isBroadcaster,
}: ViewerParticipationProps) {
  const currentAccount = useCurrentAccount();
  const [handRaised, setHandRaised] = useState(false);
  const [isCoHost, setIsCoHost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Don't show for broadcasters or if participation is disabled
  if (isBroadcaster || !allowParticipation || !currentAccount?.address) {
    return null;
  }

  // Poll participant status every 3 seconds
  useEffect(() => {
    const checkParticipantStatus = async () => {
      try {
        const response = await fetch(`/api/live/participants?streamId=${streamId}`);

        if (response.ok) {
          const data = await response.json();
          const participant = data.participants?.find(
            (p: any) => p.userId === currentAccount.address
          );

          if (participant) {
            setHandRaised(participant.handRaised || false);
            setIsCoHost(participant.role === 'co-host');
          }
        }
      } catch (err) {
        console.error('[ViewerParticipation] Error checking status:', err);
      }
    };

    checkParticipantStatus();
    const interval = setInterval(checkParticipantStatus, 3000);

    return () => clearInterval(interval);
  }, [streamId, currentAccount?.address]);

  const handleRaiseHand = async () => {
    if (!currentAccount?.address) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/live/raise-hand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          userId: currentAccount.address,
          userName: `User-${currentAccount.address.slice(0, 8)}`,
          message: '',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to raise hand');
      }

      setHandRaised(true);
    } catch (err: any) {
      console.error('[ViewerParticipation] Raise hand error:', err);
      setError(err.message || 'Failed to send request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLowerHand = async () => {
    if (!currentAccount?.address) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/live/raise-hand', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          userId: currentAccount.address,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel request');
      }

      setHandRaised(false);
    } catch (err: any) {
      console.error('[ViewerParticipation] Lower hand error:', err);
      setError(err.message || 'Failed to cancel request');
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already a co-host, show active status
  if (isCoHost) {
    return (
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <div className="px-4 py-3 bg-gradient-to-br from-[#97F0E5] to-[#C584F6] rounded-[32px]
          shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
          outline outline-2 outline-offset-[-2px] outline-black
          flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-black text-sm font-bold font-['Outfit']">
            🎙️ You're on stage
          </span>
        </div>
      </div>
    );
  }

  // If hand is raised, show pending status with cancel option
  if (handRaised) {
    return (
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <div className="p-4 bg-white rounded-[32px]
          shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
          outline outline-2 outline-offset-[-2px] outline-black
          flex flex-col gap-3 max-w-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#F9D546] to-[#F946AC] rounded-full
              flex items-center justify-center
              shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
              outline outline-1 outline-offset-[-1px] outline-black
              animate-pulse">
              <span className="text-lg">✋</span>
            </div>
            <div className="flex-1">
              <p className="text-black text-sm font-bold font-['Outfit']">
                Request Sent
              </p>
              <p className="text-black/70 text-xs font-['Outfit']">
                Waiting for host approval...
              </p>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-xs font-['Outfit']">{error}</p>
          )}

          <button
            onClick={handleLowerHand}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-[#FFEEE5] rounded-[32px] text-black text-sm font-bold font-['Outfit']
              shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
              outline outline-1 outline-offset-[-1px] outline-black
              hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1.00)]
              hover:translate-x-[1px]
              hover:translate-y-[1px]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all">
            {isLoading ? 'Cancelling...' : 'Cancel Request'}
          </button>
        </div>
      </div>
    );
  }

  // Default: Show "Request to Join" button - Hide on mobile
  return (
    <div className="absolute bottom-4 right-4 pointer-events-auto hidden md:block">
      <div className="flex flex-col gap-2 items-end">
        {error && (
          <div className="px-3 py-2 bg-red-600/90 rounded-lg backdrop-blur-sm">
            <p className="text-white text-xs font-['Outfit']">{error}</p>
          </div>
        )}

        <button
          onClick={handleRaiseHand}
          disabled={isLoading}
          className="px-6 py-3 bg-white rounded-[32px] text-black font-bold font-['Outfit']
            shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
            outline outline-2 outline-offset-[-2px] outline-black
            hover:bg-[#FFEEE5]
            hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
            hover:translate-x-[1px]
            hover:translate-y-[1px]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all
            flex items-center gap-2">
          <span className="text-xl">✋</span>
          <span>{isLoading ? 'Sending...' : 'Request to Join Stream'}</span>
        </button>
      </div>
    </div>
  );
}
