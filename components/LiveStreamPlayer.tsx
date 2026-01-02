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

interface LiveStreamPlayerProps {
  isBroadcaster: boolean;
}

export default function LiveStreamPlayer({ isBroadcaster }: LiveStreamPlayerProps) {
  const [broadcasterVideoTrack, setBroadcasterVideoTrack] = useState<TrackReferenceOrPlaceholder | null>(null);
  const [broadcasterAudioTrack, setBroadcasterAudioTrack] = useState<TrackReferenceOrPlaceholder | null>(null);
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);

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
      <div className="relative w-full h-full bg-black rounded-[32px] overflow-hidden">
        {/* Main video (screen share or camera) */}
        {mainTrack && mainTrack.publication ? (
          <VideoTrack
            trackRef={mainTrack}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-walrus-mint to-walrus-grape
                rounded-full flex items-center justify-center mx-auto mb-4
                border-4 border-black">
                <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-white text-xl font-bold font-['Outfit'] mb-2">
                Camera not detected
              </p>
              <p className="text-white/70 text-sm font-['Outfit']">
                Please enable your camera to start broadcasting
              </p>
            </div>
          </div>
        )}

        {/* Participant thumbnails (own camera when screen sharing + co-hosts) - Clickable to pin */}
        {thumbnailTracks.length > 0 && (
          <div className="absolute top-20 right-4 flex flex-col gap-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {thumbnailTracks.map((track, index) => {
              const isPinned = pinnedParticipantId === track.participant.identity;
              const isActiveSpeaker = activeSpeakerId === track.participant.identity;

              return track && track.publication && (
                <div
                  key={track.participant.identity + index}
                  onClick={() => {
                    // Toggle pin: if already pinned, unpin; otherwise pin this participant
                    setPinnedParticipantId(isPinned ? null : track.participant.identity);
                  }}
                  className={`w-40 h-32 rounded-2xl overflow-hidden
                    shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)]
                    bg-gray-900 relative opacity-80 hover:opacity-100 transition-all
                    cursor-pointer hover:scale-105
                    ${isPinned ? 'outline outline-4 outline-offset-[-4px] outline-yellow-400 ring-2 ring-yellow-400' :
                      isActiveSpeaker ? 'outline outline-3 outline-offset-[-3px] outline-green-400' :
                      'outline outline-2 outline-offset-[-2px] outline-white/60'}`}>
                  <VideoTrack
                    trackRef={track}
                    className="w-full h-full object-cover"
                  />
                  {/* Participant name overlay */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded-lg backdrop-blur-sm">
                    <p className="text-white text-xs font-semibold font-['Outfit']">
                      {track.participant.isLocal
                        ? 'You'
                        : (track.participant.name || track.participant.identity.slice(0, 8))}
                    </p>
                  </div>
                  {/* Pin indicator */}
                  {isPinned && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                      </svg>
                    </div>
                  )}
                  {/* Active speaker indicator */}
                  {!isPinned && isActiveSpeaker && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
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

        {/* Broadcasting indicator */}
        <div className="absolute top-4 left-4">
          <div className="px-4 py-2 bg-red-600/90 rounded-full backdrop-blur-sm
            flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <p className="text-white text-sm font-semibold font-['Outfit'] tracking-wide">
              LIVE
            </p>
          </div>
        </div>

        {/* Screen sharing indicator */}
        {isShowingScreenShare && (
          <div className="absolute top-16 left-4">
            <div className="w-10 h-10 bg-purple-600/90 rounded-full backdrop-blur-sm
              flex items-center justify-center
              shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
              outline outline-2 outline-offset-[-2px] outline-white">
              <span className="text-xl">📺</span>
            </div>
          </div>
        )}

        {/* Viewer count */}
        <div className="absolute top-4 right-4">
          <div className="px-3 py-3 bg-black/80 rounded-full backdrop-blur-sm
            border-2 border-white/30 flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-white text-sm font-bold font-['Outfit'] min-w-[1.5rem] text-center">
              {viewerCount}
            </span>
          </div>
        </div>
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
    <div className="relative w-full h-full bg-black rounded-[32px] overflow-hidden">
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

      {/* Participant thumbnails - Clickable to pin and switch view */}
      {otherVideoTracks.length > 0 && (
        <div className="absolute top-20 right-4 flex flex-col gap-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {otherVideoTracks.map((track, index) => {
            const isPinned = pinnedParticipantId === track.participant.identity;
            const isActiveSpeaker = activeSpeakerId === track.participant.identity;

            return (
              <div
                key={track.participant.identity + index}
                onClick={() => {
                  // Toggle pin: if already pinned, unpin; otherwise pin this participant
                  setPinnedParticipantId(isPinned ? null : track.participant.identity);
                }}
                className={`w-40 h-32 rounded-2xl overflow-hidden
                  shadow-[3px_3px_0px_0px_rgba(0,0,0,0.6)]
                  bg-gray-900 relative opacity-80 hover:opacity-100 transition-all
                  cursor-pointer hover:scale-105
                  ${isPinned ? 'outline outline-4 outline-offset-[-4px] outline-yellow-400 ring-2 ring-yellow-400' :
                    isActiveSpeaker ? 'outline outline-3 outline-offset-[-3px] outline-green-400' :
                    'outline outline-2 outline-offset-[-2px] outline-white/60'}`}>
                {track.publication ? (
                  <VideoTrack
                    trackRef={track}
                    className="w-full h-full object-cover"
                  />
                ) : null}
                {/* Participant name overlay */}
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded-lg backdrop-blur-sm">
                  <p className="text-white text-xs font-semibold font-['Outfit']">
                    {track.participant.name || track.participant.identity.slice(0, 8)}
                  </p>
                </div>
                {/* Pin indicator */}
                {isPinned && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                    </svg>
                  </div>
                )}
                {/* Active speaker indicator */}
                {!isPinned && isActiveSpeaker && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
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

      {/* Live indicator */}
      <div className="absolute top-4 left-4">
        <div className="px-4 py-2 bg-red-600/90 rounded-full backdrop-blur-sm
          flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <p className="text-white text-sm font-semibold font-['Outfit'] tracking-wide">
            LIVE
          </p>
        </div>
      </div>

      {/* Screen sharing indicator */}
      {isShowingScreenShare && (
        <div className="absolute top-16 left-4">
          <div className="w-10 h-10 bg-purple-600/90 rounded-full backdrop-blur-sm
            flex items-center justify-center
            shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
            outline outline-2 outline-offset-[-2px] outline-white">
            <span className="text-xl">📺</span>
          </div>
        </div>
      )}

      {/* Viewer count */}
      <div className="absolute top-4 right-4">
        <div className="px-3 py-3 bg-black/80 rounded-full backdrop-blur-sm
          border-2 border-white/30 flex items-center gap-2">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-white text-sm font-bold font-['Outfit'] min-w-[1.5rem] text-center">
            {viewerCount}
          </span>
        </div>
      </div>
    </div>
  );
}
