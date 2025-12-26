'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { LiveStreamLayout } from '@/components/LiveStreamLayout';

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

  if (error || !token || !streamInfo) {
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
    <LiveStreamLayout
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ''}
      streamId={streamInfo.id}
      streamInfo={streamInfo}
      userId={currentAccount?.address || ''}
      userName={`Broadcaster-${currentAccount?.address.slice(0, 8)}`}
      isBroadcaster={true}
      isModerator={true}
      onEndStream={handleEndStream}
    />
  );
}
