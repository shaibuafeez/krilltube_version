'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRouter } from 'next/navigation';

interface Invitation {
  id: string;
  streamId: string;
  inviterId: string;
  inviteeId: string;
  inviteeName: string;
  status: string;
  sentAt: string;
  stream: {
    id: string;
    title: string;
    description?: string;
    status: string;
    scheduledAt?: string;
    creatorId: string;
  };
}

export default function InvitationNotifications() {
  const currentAccount = useCurrentAccount();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Don't show if no wallet connected
  if (!currentAccount?.address) {
    console.log('[InvitationNotifications] No wallet connected, component hidden');
    return null;
  }

  console.log('[InvitationNotifications] Component rendering for user:', currentAccount.address);

  // Poll for invitations every 5 seconds and auto-open when new invitation arrives
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        console.log('[InvitationNotifications] Fetching invitations for user:', currentAccount.address);
        const response = await fetch(
          `/api/live/invitations?userId=${currentAccount.address}`
        );

        console.log('[InvitationNotifications] Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[InvitationNotifications] Received data:', data);
          // Only show pending invitations
          const pendingInvitations = data.invitations?.filter(
            (inv: Invitation) => inv.status === 'pending'
          ) || [];
          console.log('[InvitationNotifications] Pending invitations:', pendingInvitations);

          // Auto-open panel when new invitation arrives
          if (pendingInvitations.length > 0 && invitations.length === 0) {
            console.log('[InvitationNotifications] New invitation detected! Auto-opening panel...');
            setIsOpen(true);
          }

          setInvitations(pendingInvitations);
        }
      } catch (err) {
        console.error('[InvitationNotifications] Error fetching:', err);
      }
    };

    fetchInvitations();
    const interval = setInterval(fetchInvitations, 5000);

    return () => clearInterval(interval);
  }, [currentAccount?.address, invitations.length]);

  const handleRespond = async (invitationId: string, accept: boolean) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/live/invitations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId,
          userId: currentAccount?.address,
          accept,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to respond to invitation');
      }

      // Remove from local state
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));

      // If accepted, show success message
      if (accept) {
        console.log('[InvitationNotifications] Invitation accepted! User promoted to co-host.');
        console.log('[InvitationNotifications] Watch page will detect role change and upgrade permissions.');

        // Close the notification panel after 2 seconds
        setTimeout(() => {
          setIsOpen(false);
        }, 2000);
      }
    } catch (err: any) {
      console.error('[InvitationNotifications] Respond error:', err);
      setError(err.message || 'Failed to respond to invitation');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show if no invitations
  if (invitations.length === 0) {
    return null;
  }

  // Notification badge - positioned inside video container
  const notificationBadge = (
    <button
      onClick={() => {
        console.log('[InvitationNotifications] Badge clicked, opening panel');
        setIsOpen(!isOpen);
      }}
      className="absolute top-4 left-4 pointer-events-auto z-30
        w-14 h-14 bg-gradient-to-br from-[#F9D546] to-[#F946AC] rounded-full
        shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
        outline outline-2 outline-offset-[-2px] outline-black
        hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
        hover:translate-x-[1px]
        hover:translate-y-[1px]
        transition-all
        flex items-center justify-center">
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
          d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
        />
      </svg>
      <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full
        flex items-center justify-center
        border-2 border-white animate-pulse">
        <span className="text-white text-xs font-bold">{invitations.length}</span>
      </div>
    </button>
  );

  if (!isOpen) {
    return notificationBadge;
  }

  return (
    <>
      {notificationBadge}

      {/* Notifications Panel - positioned inside video container */}
      <div className="absolute top-20 left-4 pointer-events-auto z-40 w-96 max-h-[calc(100vh-140px)]
        bg-white rounded-[32px]
        shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
        outline outline-[3px] outline-offset-[-3px] outline-black
        flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b-2 border-black">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-black font-['Outfit']">
              Stream Invitations
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
            You have {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Invitations List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 rounded-2xl border-2 border-red-600">
              <p className="text-red-600 text-sm font-['Outfit']">{error}</p>
            </div>
          )}

          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="p-4 bg-gradient-to-br from-[#FFEEE5] to-[#F9D546]/20 rounded-2xl
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                outline outline-2 outline-offset-[-2px] outline-black
                space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#97F0E5] to-[#C584F6] rounded-full
                    flex items-center justify-center
                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                    outline outline-1 outline-offset-[-1px] outline-black">
                    <span className="text-sm">🎙️</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-black text-sm font-bold font-['Outfit']">
                      Stream Invitation
                    </p>
                    <p className="text-black/60 text-xs font-['Outfit']">
                      {new Date(invitation.sentAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <p className="text-black text-base font-bold font-['Outfit']">
                    {invitation.stream.title}
                  </p>
                  {invitation.stream.description && (
                    <p className="text-black/70 text-sm font-['Outfit']">
                      {invitation.stream.description}
                    </p>
                  )}
                  <p className="text-black/60 text-xs font-['Outfit']">
                    Host: {invitation.inviterId.slice(0, 8)}...
                  </p>
                  {invitation.stream.status === 'live' && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 rounded-full">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-xs font-bold">LIVE NOW</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(invitation.id, true)}
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
                  {invitation.stream.status === 'live' ? '✓ Join Now' : '✓ Accept'}
                </button>
                <button
                  onClick={() => handleRespond(invitation.id, false)}
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
                  ✗ Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
