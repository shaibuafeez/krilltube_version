'use client';

import { VideoTrack, TrackReferenceOrPlaceholder } from '@livekit/components-react';

interface ParticipantGridViewProps {
  tracks: TrackReferenceOrPlaceholder[];
  onParticipantClick: (participantId: string) => void;
  pinnedParticipantId: string | null;
  activeSpeakerId: string | null;
}

export default function ParticipantGridView({
  tracks,
  onParticipantClick,
  pinnedParticipantId,
  activeSpeakerId,
}: ParticipantGridViewProps) {
  console.log('[ParticipantGridView] RENDERING with', tracks.length, 'tracks');

  // Determine grid columns based on participant count
  const getGridColumns = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const gridCols = getGridColumns(tracks.length);
  console.log('[ParticipantGridView] Grid columns:', gridCols);

  if (tracks.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center max-w-xs px-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm
            rounded-2xl flex items-center justify-center mx-auto mb-3
            border border-white/20">
            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <p className="text-white text-base font-semibold font-['Outfit'] mb-1">
            No participants yet
          </p>
          <p className="text-white/60 text-xs font-['Outfit']">
            Waiting for others to join...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black p-2 overflow-auto">
      <div className={`grid ${gridCols} gap-2 h-full auto-rows-fr`}>
        {tracks.map((track, index) => {
          if (!track.publication) return null;

          const isPinned = pinnedParticipantId === track.participant.identity;
          const isActiveSpeaker = activeSpeakerId === track.participant.identity;
          const isScreenShare = track.source === 'screen_share';

          return (
            <div
              key={track.participant.identity + track.source + index}
              onClick={() => onParticipantClick(track.participant.identity)}
              className={`relative rounded-lg overflow-hidden bg-gray-900
                cursor-pointer transition-all
                border-2 border-black
                shadow-[2px_2px_0_0_black]
                hover:shadow-[3px_3px_0_0_black]
                hover:scale-[1.02]
                ${isPinned ? 'ring-4 ring-blue-500 ring-offset-2 ring-offset-black' : ''}
                ${isActiveSpeaker && !isPinned ? 'ring-4 ring-green-500 ring-offset-2 ring-offset-black' : ''}`}
            >
              {/* Video Track */}
              <VideoTrack
                trackRef={track}
                className="w-full h-full object-cover"
              />

              {/* Participant Info Overlay - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-center gap-2">
                  {/* Active Speaker Indicator */}
                  {isActiveSpeaker && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}

                  {/* Screen Share Icon */}
                  {isScreenShare && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}

                  {/* Participant Name */}
                  <p className="text-white text-xs font-semibold font-['Outfit'] truncate flex-1">
                    {track.participant.isLocal
                      ? 'You'
                      : (track.participant.name || track.participant.identity.slice(0, 12))}
                    {isScreenShare ? "'s screen" : ''}
                  </p>

                  {/* Pinned Indicator */}
                  {isPinned && (
                    <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Audio Muted Indicator - Top Right */}
              {track.participant.isMicrophoneEnabled === false && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                </div>
              )}

              {/* Camera Off Indicator */}
              {track.participant.isCameraEnabled === false && !isScreenShare && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white text-lg font-bold font-['Outfit']">
                        {track.participant.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs font-['Outfit']">Camera off</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
