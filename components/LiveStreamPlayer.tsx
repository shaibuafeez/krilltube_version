'use client';

import { useEffect, useState } from 'react';
import {
  useTracks,
  VideoTrack,
  AudioTrack,
  TrackReferenceOrPlaceholder,
  useParticipants
} from '@livekit/components-react';
import { Track, RemoteTrack, RemoteVideoTrack, RemoteAudioTrack, Participant } from 'livekit-client';
import ParticipantGridView from './ParticipantGridView';
import ParticipantSidebar from './ParticipantSidebar';

interface LiveStreamPlayerProps {
  isBroadcaster: boolean;
  viewMode?: 'speaker' | 'grid';
  onViewModeChange?: (mode: 'speaker' | 'grid') => void;
}

export default function LiveStreamPlayer({
  isBroadcaster,
  viewMode = 'speaker',
  onViewModeChange
}: LiveStreamPlayerProps) {
  const [broadcasterVideoTrack, setBroadcasterVideoTrack] = useState<TrackReferenceOrPlaceholder | null>(null);
  const [broadcasterAudioTrack, setBroadcasterAudioTrack] = useState<TrackReferenceOrPlaceholder | null>(null);
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [isParticipantSidebarOpen, setIsParticipantSidebarOpen] = useState(false);

  // Get all participants in the room
  const participants = useParticipants();

  // Calculate viewer count (total participants - 1 broadcaster)
  const viewerCount = Math.max(0, participants.length - 1);

  // Get all video, audio, and screen share tracks in the room
  const videoTracks = useTracks([Track.Source.Camera], {
    onlySubscribed: true,
  });

  const audioTracks = useTracks([Track.Source.Microphone], {
    onlySubscribed: true,
  });

  const screenShareTracks = useTracks([Track.Source.ScreenShare], {
    onlySubscribed: true,
  });

  // Active speaker detection
  useEffect(() => {
    const checkActiveSpeaker = () => {
      // Find the participant who is currently speaking (highest audio level)
      const speakingParticipants = participants.filter(p => p.isSpeaking);

      if (speakingParticipants.length > 0) {
        // Get the loudest speaker (first one for now, could be enhanced with audio levels)
        setActiveSpeakerId(speakingParticipants[0].identity);
      } else {
        // No one speaking, clear active speaker after a delay
        const timeout = setTimeout(() => setActiveSpeakerId(null), 2000);
        return () => clearTimeout(timeout);
      }
    };

    checkActiveSpeaker();
    const interval = setInterval(checkActiveSpeaker, 500); // Check every 500ms

    return () => clearInterval(interval);
  }, [participants]);

  useEffect(() => {
    // Find the broadcaster's tracks (should be the first/only camera track if not broadcaster)
    if (!isBroadcaster && videoTracks.length > 0) {
      setBroadcasterVideoTrack(videoTracks[0]);
    }

    if (!isBroadcaster && audioTracks.length > 0) {
      setBroadcasterAudioTrack(audioTracks[0]);
    }
  }, [videoTracks, audioTracks, isBroadcaster]);

  // Handler for participant click (pin/unpin)
  const handleParticipantClick = (participantId: string) => {
    if (pinnedParticipantId === participantId) {
      // Unpin if clicking the same participant
      setPinnedParticipantId(null);
      // Switch back to speaker view when unpinning
      if (viewMode === 'grid' && onViewModeChange) {
        onViewModeChange('speaker');
      }
    } else {
      // Pin the selected participant
      setPinnedParticipantId(participantId);
      // Switch to speaker view to focus on the pinned participant
      if (viewMode === 'grid' && onViewModeChange) {
        onViewModeChange('speaker');
      }
    }
  };

  // Handler for sidebar participant selection
  const handleSidebarSelect = (participantId: string) => {
    setPinnedParticipantId(participantId);
    // Switch to speaker view when selecting from sidebar
    if (viewMode === 'grid' && onViewModeChange) {
      onViewModeChange('speaker');
    }
  };

  // Combine all tracks for grid view (camera + screen share)
  const allGridTracks = [...videoTracks, ...screenShareTracks].filter(track => track.publication);

  // Debug logging
  console.log('[LiveStreamPlayer] RENDER - viewMode:', viewMode);
  console.log('[LiveStreamPlayer] RENDER - allGridTracks count:', allGridTracks.length);
  console.log('[LiveStreamPlayer] RENDER - isBroadcaster:', isBroadcaster);
  console.log('[LiveStreamPlayer] RENDER - Will show grid?', viewMode === 'grid');

  if (isBroadcaster) {
    // Broadcaster view - show their own camera preview or screen share + co-hosts
    const myVideoTrack = videoTracks.find(track => track.participant.isLocal);
    const myAudioTrack = audioTracks.find(track => track.participant.isLocal);
    const myScreenShareTrack = screenShareTracks.find(track => track.participant.isLocal);

    // Check if someone else is screen sharing (co-host)
    const otherScreenShare = screenShareTracks.find(track => !track.participant.isLocal);

    // Determine main track based on pinned participant, active speaker, or screen share
    let mainTrack: TrackReferenceOrPlaceholder | undefined;

    if (pinnedParticipantId) {
      // Show pinned participant's screen share if available, otherwise camera
      const pinnedScreenShare = screenShareTracks.find(t => t.participant.identity === pinnedParticipantId);
      const pinnedVideo = videoTracks.find(t => t.participant.identity === pinnedParticipantId);
      mainTrack = pinnedScreenShare || pinnedVideo;
    } else if (activeSpeakerId && !myScreenShareTrack) {
      // Show active speaker's screen share if available, otherwise camera (unless I'm screen sharing)
      const activeSpeakerScreenShare = screenShareTracks.find(t => t.participant.identity === activeSpeakerId);
      const activeSpeakerVideo = videoTracks.find(t => t.participant.identity === activeSpeakerId);
      mainTrack = activeSpeakerScreenShare || activeSpeakerVideo;
    }

    // Fallback: prioritize screen shares, then own camera
    if (!mainTrack) {
      mainTrack = myScreenShareTrack || otherScreenShare || myVideoTrack;
    }

    const isShowingScreenShare = !!(myScreenShareTrack || otherScreenShare || screenShareTracks.find(t => t === mainTrack));

    // Get all other participants (co-hosts) for thumbnails
    const otherVideoTracks = videoTracks.filter(track => !track.participant.isLocal);

    // When screen sharing, show own camera + co-hosts in thumbnails
    const thumbnailTracks = isShowingScreenShare
      ? (myScreenShareTrack ? [myVideoTrack, ...otherVideoTracks] : otherVideoTracks).filter(Boolean)
      : otherVideoTracks;

    return (
      <div className="relative w-full h-full bg-black overflow-hidden">
        {/* Debug indicator */}
        <div className="absolute top-20 left-4 z-50 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-md border border-white/10">
          <span className="text-white/60 text-[10px] font-medium font-['Outfit']">
            {viewMode} · {allGridTracks.length}
          </span>
        </div>

        {/* Participant Sidebar */}
        <ParticipantSidebar
          participants={participants}
          videoTracks={videoTracks}
          screenShareTracks={screenShareTracks}
          onSelect={handleSidebarSelect}
          selectedParticipantId={pinnedParticipantId}
          activeSpeakerId={activeSpeakerId}
          isOpen={isParticipantSidebarOpen}
          onToggle={() => setIsParticipantSidebarOpen(!isParticipantSidebarOpen)}
        />

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <ParticipantGridView
            tracks={allGridTracks}
            onParticipantClick={handleParticipantClick}
            pinnedParticipantId={pinnedParticipantId}
            activeSpeakerId={activeSpeakerId}
          />
        ) : (
          /* Speaker View */
          <>
            {/* Main video (screen share or camera) */}
            {mainTrack && mainTrack.publication ? (
          <VideoTrack
            trackRef={mainTrack}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center max-w-xs px-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm
                rounded-2xl flex items-center justify-center mx-auto mb-3
                border border-white/20">
                <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <p className="text-white text-base font-semibold font-['Outfit'] mb-1">
                No camera detected
              </p>
              <p className="text-white/60 text-xs font-['Outfit']">
                Enable camera to start
              </p>
            </div>
          </div>
        )}

        {/* Participant thumbnails - Google Meet style (minimal) */}
        {thumbnailTracks.length > 0 && (
          <div className="absolute bottom-24 right-4 flex flex-col gap-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {thumbnailTracks.map((track, index) => {
              const isPinned = pinnedParticipantId === track?.participant.identity;
              const isActiveSpeaker = activeSpeakerId === track?.participant.identity;

              return track && track.publication && (
                <div
                  key={track.participant.identity + index}
                  onClick={() => {
                    setPinnedParticipantId(isPinned ? null : track.participant.identity);
                  }}
                  className={`w-28 h-20 rounded-lg overflow-hidden bg-gray-900 relative
                    cursor-pointer transition-all hover:scale-105
                    ${isPinned ? 'ring-2 ring-blue-500' :
                      isActiveSpeaker ? 'ring-2 ring-green-500' : ''}`}>
                  <VideoTrack
                    trackRef={track}
                    className="w-full h-full object-cover"
                  />
                  {/* Participant name overlay */}
                  <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 bg-gray-900/80 backdrop-blur-sm rounded">
                    <p className="text-white text-[10px] font-medium font-['Outfit'] truncate">
                      {track.participant.isLocal
                        ? 'You'
                        : (track.participant.name || track.participant.identity.slice(0, 8))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Render all audio tracks */}
        {audioTracks.map((track) => (
          track.publication && (
            <AudioTrack key={track.participant.identity} trackRef={track} />
          )
        ))}

        {/* Screen sharing indicator */}
        {isShowingScreenShare && (
          <div className="absolute top-4 left-4">
            <div className="px-3 py-1.5 bg-gray-900/90 backdrop-blur-md rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white text-xs font-medium font-['Outfit']">Presenting</span>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    );
  }

  // Viewer view - show all participants with active speaker detection and manual control
  const screenShareTrack = screenShareTracks.length > 0 ? screenShareTracks[0] : null;

  // Determine main track based on pinned participant, active speaker, or screen share
  let mainTrack: TrackReferenceOrPlaceholder | null = null;

  if (pinnedParticipantId) {
    // Show pinned participant's screen share if available, otherwise camera
    const pinnedScreenShare = screenShareTracks.find(t => t.participant.identity === pinnedParticipantId);
    const pinnedVideo = videoTracks.find(t => t.participant.identity === pinnedParticipantId);
    mainTrack = pinnedScreenShare || pinnedVideo || null;
  } else if (activeSpeakerId) {
    // Show active speaker's screen share if available, otherwise camera
    const activeSpeakerScreenShare = screenShareTracks.find(t => t.participant.identity === activeSpeakerId);
    const activeSpeakerVideo = videoTracks.find(t => t.participant.identity === activeSpeakerId);
    mainTrack = activeSpeakerScreenShare || activeSpeakerVideo || null;
  }

  // Fallback: screen share OR first camera track
  if (!mainTrack) {
    mainTrack = screenShareTrack || (videoTracks.length > 0 ? videoTracks[0] : null);
  }

  const isShowingScreenShare = !!(screenShareTrack || screenShareTracks.find(t => t === mainTrack));

  // Get all other camera tracks for thumbnails (exclude the one shown on main screen)
  const otherVideoTracks = videoTracks.filter(track => track !== mainTrack);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Participant Sidebar */}
      <ParticipantSidebar
        participants={participants}
        videoTracks={videoTracks}
        screenShareTracks={screenShareTracks}
        onSelect={handleSidebarSelect}
        selectedParticipantId={pinnedParticipantId}
        activeSpeakerId={activeSpeakerId}
        isOpen={isParticipantSidebarOpen}
        onToggle={() => setIsParticipantSidebarOpen(!isParticipantSidebarOpen)}
      />

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <ParticipantGridView
          tracks={allGridTracks}
          onParticipantClick={handleParticipantClick}
          pinnedParticipantId={pinnedParticipantId}
          activeSpeakerId={activeSpeakerId}
        />
      ) : (
        /* Speaker View */
        <>
          {/* Main video (screen share or primary camera) */}
          {mainTrack && mainTrack.publication ? (
            <VideoTrack
              trackRef={mainTrack}
              className="w-full h-full object-contain"
            />
          ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white text-xl font-bold font-['Outfit'] mb-2">
              Waiting for broadcaster...
            </p>
            <p className="text-white/70 text-sm font-['Outfit']">
              The stream will begin shortly
            </p>
          </div>
        </div>
      )}

      {/* Participant thumbnails - Google Meet style (minimal) */}
      {otherVideoTracks.length > 0 && (
        <div className="absolute bottom-24 right-4 flex flex-col gap-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {otherVideoTracks.map((track, index) => {
            const isPinned = pinnedParticipantId === track.participant.identity;
            const isActiveSpeaker = activeSpeakerId === track.participant.identity;

            return (
              <div
                key={track.participant.identity + index}
                onClick={() => {
                  setPinnedParticipantId(isPinned ? null : track.participant.identity);
                }}
                className={`w-28 h-20 rounded-lg overflow-hidden bg-gray-900 relative
                  cursor-pointer transition-all hover:scale-105
                  ${isPinned ? 'ring-2 ring-blue-500' :
                    isActiveSpeaker ? 'ring-2 ring-green-500' : ''}`}>
                {track.publication ? (
                  <VideoTrack
                    trackRef={track}
                    className="w-full h-full object-cover"
                  />
                ) : null}
                {/* Participant name overlay */}
                <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 bg-gray-900/80 backdrop-blur-sm rounded">
                  <p className="text-white text-[10px] font-medium font-['Outfit'] truncate">
                    {track.participant.name || track.participant.identity.slice(0, 8)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Render all audio tracks */}
      {audioTracks.map((track) => (
        track.publication && (
          <AudioTrack key={track.participant.identity} trackRef={track} />
        )
      ))}

      {/* Screen sharing indicator */}
      {isShowingScreenShare && (
        <div className="absolute top-4 left-4">
          <div className="px-3 py-1.5 bg-gray-900/90 backdrop-blur-md rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium font-['Outfit']">Presenting</span>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
