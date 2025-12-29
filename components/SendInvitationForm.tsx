'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface Viewer {
  userId: string;
  userName: string;
  role: string;
}

interface SendInvitationFormProps {
  streamId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SendInvitationForm({
  streamId,
  isOpen,
  onClose,
}: SendInvitationFormProps) {
  const currentAccount = useCurrentAccount();
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [selectedViewer, setSelectedViewer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current viewers when form opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchViewers = async () => {
      try {
        console.log('[SendInvitation] Syncing participants from LiveKit...');
        // First, sync participants from LiveKit to database (backfill existing viewers)
        const syncResponse = await fetch('/api/live/sync-participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamId }),
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          console.log('[SendInvitation] Synced', syncData.synced, 'participants from LiveKit');
        } else {
          console.error('[SendInvitation] Failed to sync participants:', syncResponse.status);
        }

        // Then fetch the synced participants
        console.log('[SendInvitation] Fetching viewers for stream:', streamId);
        const response = await fetch(`/api/live/participants?streamId=${streamId}&role=viewer`);
        if (response.ok) {
          const data = await response.json();
          console.log('[SendInvitation] Fetched viewers:', data.participants);
          setViewers(data.participants || []);
        } else {
          console.error('[SendInvitation] Failed to fetch viewers:', response.status);
        }
      } catch (err) {
        console.error('[SendInvitation] Error fetching viewers:', err);
      }
    };

    fetchViewers();

    // Refresh viewer list every 3 seconds while form is open
    const interval = setInterval(fetchViewers, 3000);
    return () => clearInterval(interval);
  }, [isOpen, streamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      return;
    }

    if (!selectedViewer) {
      setError('Please select a viewer to invite');
      return;
    }

    const viewer = viewers.find(v => v.userId === selectedViewer);
    if (!viewer) {
      setError('Selected viewer not found');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('[SendInvitation] Sending invitation...', {
        streamId,
        inviterId: currentAccount.address,
        inviteeId: viewer.userId,
        inviteeName: viewer.userName,
      });

      const response = await fetch('/api/live/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          inviterId: currentAccount.address,
          inviteeId: viewer.userId,
          inviteeName: viewer.userName,
        }),
      });

      console.log('[SendInvitation] Response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error('[SendInvitation] Error response:', data);
        throw new Error(data.error || 'Failed to send invitation');
      }

      const data = await response.json();
      console.log('[SendInvitation] Success response:', data);
      setSuccess(data.message || 'Invitation sent successfully!');

      // Reset form
      setSelectedViewer('');

      // Close form after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      console.error('[SendInvitation] Error:', err);
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white rounded-[32px]
        shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
        outline outline-[3px] outline-offset-[-3px] outline-black
        space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black font-['Outfit']">
            Invite to Stream
          </h2>
          <button
            onClick={onClose}
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
          Invite another user to join your stream as a co-host
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-black font-['Outfit']">
              Select Viewer to Invite
            </label>
            {viewers.length === 0 ? (
              <div className="px-4 py-8 bg-[#FFEEE5] rounded-2xl
                outline outline-2 outline-offset-[-2px] outline-black
                text-center">
                <p className="text-black/60 text-sm font-['Outfit']">
                  No viewers currently watching
                </p>
              </div>
            ) : (
              <select
                value={selectedViewer}
                onChange={(e) => setSelectedViewer(e.target.value)}
                className="w-full px-4 py-3 bg-[#FFEEE5] rounded-2xl
                  text-black
                  outline outline-2 outline-offset-[-2px] outline-black
                  focus:bg-white
                  transition-colors
                  font-['Outfit']
                  cursor-pointer"
                disabled={isLoading}
              >
                <option value="">-- Select a viewer --</option>
                {viewers.map((viewer) => (
                  <option key={viewer.userId} value={viewer.userId}>
                    {viewer.userName} ({viewer.userId.slice(0, 8)}...)
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-100 rounded-2xl border-2 border-red-600">
              <p className="text-red-600 text-sm font-['Outfit']">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 rounded-2xl border-2 border-green-600">
              <p className="text-green-600 text-sm font-['Outfit']">{success}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-white rounded-[32px] text-black font-bold font-['Outfit']
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                outline outline-2 outline-offset-[-2px] outline-black
                hover:bg-[#FFEEE5]
                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                hover:translate-x-[1px]
                hover:translate-y-[1px]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-[#97F0E5] to-[#C584F6] rounded-[32px]
                text-black font-bold font-['Outfit']
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                outline outline-2 outline-offset-[-2px] outline-black
                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                hover:translate-x-[1px]
                hover:translate-y-[1px]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all">
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
