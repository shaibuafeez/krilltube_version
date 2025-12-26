'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { LiveStreamLayout } from '@/components/LiveStreamLayout';

export default function WatchStreamPage() {
  const params = useParams();
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const roomName = params.roomName as string;

  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [streamInfo, setStreamInfo] = useState<any>(null);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (!roomName) return;

    if (!currentAccount?.address) {
      // Allow watching without wallet, use anonymous identity
      const anonymousId = `viewer-${Math.random().toString(36).substring(7)}`;
      const anonymousName = `Anonymous-${anonymousId.slice(0, 8)}`;
      setUserId(anonymousId);
      setUserName(anonymousName);
      fetchToken(anonymousId, anonymousName);
    } else {
      const name = `User-${currentAccount.address.slice(0, 8)}`;
      setUserId(currentAccount.address);
      setUserName(name);
      fetchToken(currentAccount.address, name);
    }
  }, [currentAccount?.address, roomName]);

  const fetchToken = async (userId: string, userName: string) => {
    try {
      const response = await fetch('/api/live/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName,
          userId,
          role: 'viewer',
          userName,
        }),
      });

      if (!response.ok) {
        throw new Error('Stream not found or not available');
      }

      const data = await response.json();
      setToken(data.token);
      setStreamInfo(data.stream);
      setIsLoading(false);
    } catch (err: any) {
      console.error('[Watch] Error fetching token:', err);
      setError(err.message || 'Failed to join stream');
      setIsLoading(false);
    }
  };

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

  if (error || !token || !streamInfo || !userId || !userName) {
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
    <LiveStreamLayout
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ''}
      streamId={streamInfo.id}
      streamInfo={streamInfo}
      userId={userId}
      userName={userName}
      isBroadcaster={false}
      isModerator={false}
    />
  );
}
