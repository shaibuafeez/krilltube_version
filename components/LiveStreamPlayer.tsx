'use client';

import { useEffect, useState } from 'react';
import {
  useTracks,
  VideoTrack,
  AudioTrack,
  TrackReferenceOrPlaceholder,
  useParticipants
} from '@livekit/components-react';
import { Track, RemoteTrack, RemoteVideoTrack, RemoteAudioTrack } from 'livekit-client';

interface LiveStreamPlayerProps {
  isBroadcaster: boolean;
}

export default function LiveStreamPlayer({ isBroadcaster }: LiveStreamPlayerProps) {
  const [broadcasterVideoTrack, setBroadcasterVideoTrack] = useState<TrackReferenceOrPlaceholder | null>(null);
  const [broadcasterAudioTrack, setBroadcasterAudioTrack] = useState<TrackReferenceOrPlaceholder | null>(null);

  // Get all participants in the room
  const participants = useParticipants();

  // Calculate viewer count (total participants - 1 broadcaster)
  const viewerCount = Math.max(0, participants.length - 1);

  // Get all video and audio tracks in the room
  const videoTracks = useTracks([Track.Source.Camera], {
    onlySubscribed: true,
  });

  const audioTracks = useTracks([Track.Source.Microphone], {
    onlySubscribed: true,
  });

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
    // Broadcaster view - show their own camera preview
    const myVideoTrack = videoTracks.find(track => track.participant.isLocal);
    const myAudioTrack = audioTracks.find(track => track.participant.isLocal);

    return (
      <div className="relative w-full h-full bg-black rounded-[32px] overflow-hidden">
        {myVideoTrack && myVideoTrack.publication ? (
          <VideoTrack
            trackRef={myVideoTrack}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-walrus-mint to-walrus-grape
                rounded-full flex items-center justify-center mx-auto mb-4
                border-4 border-black">
                <span className="text-4xl">📹</span>
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

        {myAudioTrack && myAudioTrack.publication && (
          <AudioTrack trackRef={myAudioTrack} />
        )}

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

  // Viewer view - show broadcaster's stream
  return (
    <div className="relative w-full h-full bg-black rounded-[32px] overflow-hidden">
      {broadcasterVideoTrack && broadcasterVideoTrack.publication ? (
        <VideoTrack
          trackRef={broadcasterVideoTrack}
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

      {broadcasterAudioTrack && broadcasterAudioTrack.publication && (
        <AudioTrack trackRef={broadcasterAudioTrack} />
      )}

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
