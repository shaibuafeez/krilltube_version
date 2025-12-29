'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface JoinRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requestedAt: string;
  message?: string;
}

interface Participant {
  id: string;
  userId: string;
  userName: string;
  role: string;
  handRaised: boolean;
  canPublish: boolean;
  canPublishScreen: boolean;
  isScreenSharing: boolean;
}

interface ParticipantManagementPanelProps {
  streamId: string;
  creatorId: string;
  isBroadcaster: boolean;
}

export default function ParticipantManagementPanel({
  streamId,
  creatorId,
  isBroadcaster,
}: ParticipantManagementPanelProps) {
  const currentAccount = useCurrentAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [coHosts, setCoHosts] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Only show for broadcasters
  if (!isBroadcaster || !currentAccount?.address || currentAccount.address !== creatorId) {
    return null;
  }

  // Poll for join requests and participants every 3 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending join requests
        const requestsResponse = await fetch(`/api/live/join-requests?streamId=${streamId}`);
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setJoinRequests(requestsData.requests || []);
        }

        // Fetch co-hosts
        const participantsResponse = await fetch(
          `/api/live/participants?streamId=${streamId}&role=co-host`
        );
        if (participantsResponse.ok) {
          const participantsData = await participantsResponse.json();
          setCoHosts(participantsData.participants || []);
        }
      } catch (err) {
        console.error('[ParticipantPanel] Error fetching data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, [streamId]);

  const handleApprove = async (requestId: string, userId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/live/invite-to-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          requestId,
          userId,
          inviterId: currentAccount?.address,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve request');
      }

      // Remove from local state immediately for better UX
      setJoinRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err: any) {
      console.error('[ParticipantPanel] Approve error:', err);
      setError(err.message || 'Failed to approve request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/live/join-requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          streamId,
          rejectedBy: currentAccount?.address,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject request');
      }

      // Remove from local state
      setJoinRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err: any) {
      console.error('[ParticipantPanel] Reject error:', err);
      setError(err.message || 'Failed to reject request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoHost = async (userId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/live/invite-to-stage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          userId,
          removedBy: currentAccount?.address,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove co-host');
      }

      // Remove from local state
      setCoHosts((prev) => prev.filter((coHost) => coHost.userId !== userId));
    } catch (err: any) {
      console.error('[ParticipantPanel] Remove co-host error:', err);
      setError(err.message || 'Failed to remove co-host');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle button - always visible
  const toggleButton = (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="absolute top-20 right-4 z-50 pointer-events-auto
        w-14 h-14 bg-white rounded-full
        shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
        outline outline-2 outline-offset-[-2px] outline-black
        hover:bg-[#FFEEE5]
        hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
        hover:translate-x-[1px]
        hover:translate-y-[1px]
        transition-all
        flex items-center justify-center relative">
      <svg
        className="w-6 h-6 text-black"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      {joinRequests.length > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full
          flex items-center justify-center
          border-2 border-white">
          <span className="text-white text-xs font-bold">{joinRequests.length}</span>
        </div>
      )}
    </button>
  );

  if (!isOpen) {
    return toggleButton;
  }

  return (
    <>
      {toggleButton}

      {/* Panel */}
      <div className="absolute top-20 right-20 z-40 w-96 max-h-[calc(100vh-140px)] pointer-events-auto
        bg-white rounded-[32px]
        shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
        outline outline-[3px] outline-offset-[-3px] outline-black
        flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b-2 border-black">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-black font-['Outfit']">
              Participants
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-[#FFEEE5]
                flex items-center justify-center
                hover:bg-red-100
                transition-colors">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-black/70 font-['Outfit']">
            Manage join requests and co-hosts
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 rounded-2xl border-2 border-red-600">
              <p className="text-red-600 text-sm font-['Outfit']">{error}</p>
            </div>
          )}

          {/* Join Requests */}
          {joinRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-black/70 uppercase font-['Outfit']">
                Join Requests ({joinRequests.length})
              </h3>
              {joinRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 bg-[#FFEEE5] rounded-2xl
                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                    outline outline-1 outline-offset-[-1px] outline-black
                    space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#97F0E5] to-[#C584F6] rounded-full
                      flex items-center justify-center
                      shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                      outline outline-1 outline-offset-[-1px] outline-black">
                      <span className="text-xl">👤</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-black text-sm font-bold font-['Outfit']">
                        {request.requesterName}
                      </p>
                      <p className="text-black/60 text-xs font-['Outfit']">
                        {new Date(request.requestedAt).toLocaleTimeString()}
                      </p>
                      {request.message && (
                        <p className="text-black/80 text-xs font-['Outfit'] mt-1">
                          "{request.message}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request.id, request.requesterId)}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-gradient-to-br from-[#97F0E5] to-[#C584F6] rounded-[32px]
                        text-black text-sm font-bold font-['Outfit']
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                        outline outline-1 outline-offset-[-1px] outline-black
                        hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1.00)]
                        hover:translate-x-[1px]
                        hover:translate-y-[1px]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all">
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-white rounded-[32px]
                        text-black text-sm font-bold font-['Outfit']
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                        outline outline-1 outline-offset-[-1px] outline-black
                        hover:bg-red-100
                        hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1.00)]
                        hover:translate-x-[1px]
                        hover:translate-y-[1px]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all">
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {joinRequests.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#FFEEE5] rounded-full
                flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">👋</span>
              </div>
              <p className="text-black/60 text-sm font-['Outfit']">
                No pending join requests
              </p>
            </div>
          )}

          {/* Co-Hosts */}
          {coHosts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-black/70 uppercase font-['Outfit']">
                Co-Hosts ({coHosts.length})
              </h3>
              {coHosts.map((coHost) => (
                <div
                  key={coHost.id}
                  className="p-4 bg-white rounded-2xl
                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                    outline outline-1 outline-offset-[-1px] outline-black
                    flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F9D546] to-[#F946AC] rounded-full
                      flex items-center justify-center
                      shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                      outline outline-1 outline-offset-[-1px] outline-black">
                      <span className="text-xl">🎙️</span>
                    </div>
                    <div>
                      <p className="text-black text-sm font-bold font-['Outfit']">
                        {coHost.userName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {coHost.isScreenSharing && (
                          <span className="text-xs text-black/60 font-['Outfit']">📺</span>
                        )}
                        {coHost.canPublish && (
                          <span className="text-xs text-black/60 font-['Outfit']">🎥</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCoHost(coHost.userId)}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-red-100 rounded-full
                      text-red-600 text-xs font-bold font-['Outfit']
                      border border-red-600
                      hover:bg-red-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
