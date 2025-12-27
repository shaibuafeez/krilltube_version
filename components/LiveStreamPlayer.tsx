'use client';

import { useEffect, useState } from 'react';
import {
  useTracks,
  VideoTrack,
  AudioTrack,
  TrackReferenceOrPlaceholder
} from '@livekit/components-react';
import { Track, RemoteTrack, RemoteVideoTrack, RemoteAudioTrack } from 'livekit-client';

interface LiveStreamPlayerProps {
  isBroadcaster: boolean;
}

export default function LiveStreamPlayer({ isBroadcaster }: LiveStreamPlayerProps) {
  const [broadcasterVideoTrack, setBroadcasterVideoTrack] = useState<TrackReferenceOrPlaceholder | null>(null);
  const [broadcasterAudioTrack, setBroadcasterAudioTrack] = useState<TrackReferenceOrPlaceholder | null>(null);

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
          <div className="px-4 py-2 bg-red-600 rounded-full
            border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            animate-pulse">
            <p className="text-white text-sm font-bold font-['Outfit']">
              🔴 YOU ARE LIVE
            </p>
          </div>
        </div>

        {/* Viewer count placeholder */}
        <div className="absolute top-4 right-4">
          <div className="px-4 py-2 bg-black/70 rounded-full backdrop-blur-sm
            border-2 border-white">
            <p className="text-white text-sm font-bold font-['Outfit']">
              👁️ Viewers: {videoTracks.length - 1}
            </p>
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
        <div className="px-4 py-2 bg-red-600 rounded-full
          border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          animate-pulse">
          <p className="text-white text-sm font-bold font-['Outfit']">
            🔴 LIVE
          </p>
        </div>
      </div>
    </div>
  );
}
