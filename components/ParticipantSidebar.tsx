'use client';

import { Participant } from 'livekit-client';
import { VideoTrack, TrackReferenceOrPlaceholder } from '@livekit/components-react';

interface ParticipantSidebarProps {
  participants: Participant[];
  videoTracks: TrackReferenceOrPlaceholder[];
  screenShareTracks: TrackReferenceOrPlaceholder[];
  onSelect: (participantId: string) => void;
  selectedParticipantId: string | null;
  activeSpeakerId: string | null;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ParticipantSidebar({
  participants,
  videoTracks,
  screenShareTracks,
  onSelect,
  selectedParticipantId,
  activeSpeakerId,
  isOpen,
  onToggle,
}: ParticipantSidebarProps) {
  return (
    <>
      {/* Toggle Button - Top Left */}
      <button
        onClick={onToggle}
        className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full
          bg-[#202124] hover:bg-[#3c4043]
          border-2 border-gray-700/50
          flex items-center justify-center
          transition-all pointer-events-auto"
        title={isOpen ? 'Hide participants' : 'Show participants'}
      >
        {isOpen ? (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )}
      </button>

      {/* Sidebar Panel */}
      <div
        className={`absolute top-0 left-0 h-full z-40 bg-[#1c1c1e] border-r-2 border-black
          transition-all duration-300 pointer-events-auto overflow-hidden
          ${isOpen ? 'w-60' : 'w-0'}`}
      >
        <div className="h-full flex flex-col p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-bold font-['Outfit']">
              Participants ({participants.length})
            </h3>
          </div>

          {/* Participants List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {participants.map((participant) => {
              const isSelected = selectedParticipantId === participant.identity;
              const isActiveSpeaker = activeSpeakerId === participant.identity;
              const isScreenSharing = screenShareTracks.some(t => t.participant.identity === participant.identity);
              const videoTrack = videoTracks.find(t => t.participant.identity === participant.identity);

              return (
                <button
                  key={participant.identity}
                  onClick={() => onSelect(participant.identity)}
                  className={`w-full px-3 py-2 rounded-lg
                    transition-all text-left
                    ${isSelected
                      ? 'bg-[#1a73e8] text-white'
                      : 'bg-[#2d2d2f] hover:bg-[#3c4043] text-white'
                    }
                    ${isActiveSpeaker && !isSelected ? 'ring-2 ring-green-500' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Video Thumbnail */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 relative">
                      {videoTrack && videoTrack.publication ? (
                        <VideoTrack
                          trackRef={videoTrack}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold font-['Outfit']">
                            {(participant.name || participant.identity).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Active Speaker Indicator */}
                      {isActiveSpeaker && (
                        <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
                      )}
                    </div>

                    {/* Participant Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold font-['Outfit'] truncate">
                        {participant.isLocal
                          ? 'You'
                          : (participant.name || participant.identity.slice(0, 12))}
                      </p>

                      {/* Status Indicators */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {/* Microphone Status */}
                        {participant.isMicrophoneEnabled === false ? (
                          <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                            <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                          </svg>
                        )}

                        {/* Camera Status */}
                        {participant.isCameraEnabled === false && (
                          <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
                          </svg>
                        )}

                        {/* Screen Sharing */}
                        {isScreenSharing && (
                          <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-white/60 text-xs font-['Outfit'] text-center">
              Click to focus on a participant
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
