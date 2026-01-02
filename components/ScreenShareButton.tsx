'use client';

import { useState } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { Track } from 'livekit-client';

interface ScreenShareButtonProps {
  streamId: string;
  userId: string;
}

export default function ScreenShareButton({ streamId, userId }: ScreenShareButtonProps) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleScreenShare = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (isSharing) {
        // Stop screen sharing
        const screenTracks = localParticipant.videoTrackPublications;
        for (const [, publication] of screenTracks) {
          if (publication.source === Track.Source.ScreenShare) {
            await localParticipant.unpublishTrack(publication.track!);
          }
        }

        // Update database
        await fetch('/api/live/screen-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streamId,
            userId,
            isSharing: false,
          }),
        });

        setIsSharing(false);
      } else {
        // Start screen sharing
        await room.localParticipant.setScreenShareEnabled(true, {
          audio: true, // Include system audio if available
          resolution: { width: 1920, height: 1080 },
        });

        // Update database
        await fetch('/api/live/screen-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streamId,
            userId,
            isSharing: true,
          }),
        });

        setIsSharing(true);
      }
    } catch (err: any) {
      console.error('[ScreenShare] Error:', err);
      setError(err.message || 'Failed to toggle screen sharing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="absolute bottom-20 left-4 px-3 py-2 bg-red-600/90 rounded-lg backdrop-blur-sm z-20">
          <p className="text-white text-xs font-['Outfit']">{error}</p>
        </div>
      )}

      <button
        onClick={toggleScreenShare}
        disabled={isLoading}
        title={isSharing ? 'Stop sharing screen' : 'Share screen'}
        className={`w-12 h-12 rounded-full
          shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
          outline outline-2 outline-offset-[-2px] outline-black
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
          hover:translate-x-[1px]
          hover:translate-y-[1px]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all
          flex items-center justify-center
          ${
            isSharing
              ? 'bg-purple-600 text-white'
              : 'bg-white text-black hover:bg-[#FFEEE5]'
          }`}>
        <span className="text-xl">{isLoading ? '⏳' : isSharing ? '🛑' : '📺'}</span>
      </button>
    </>
  );
}
