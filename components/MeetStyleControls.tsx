'use client';

import { useState, useEffect } from 'react';
import { useTracks, useLocalParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';

interface MeetStyleControlsProps {
  onLeave?: () => void;
  isBroadcaster?: boolean;
}

export default function MeetStyleControls({
  onLeave,
  isBroadcaster = false,
}: MeetStyleControlsProps) {
  const { localParticipant } = useLocalParticipant();
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const tracks = useTracks([
    { source: Track.Source.Camera },
    { source: Track.Source.Microphone },
    { source: Track.Source.ScreenShare },
  ]);

  // Sync state with actual track status
  useEffect(() => {
    if (localParticipant) {
      const micTrack = localParticipant.getTrackPublication(Track.Source.Microphone);
      const cameraTrack = localParticipant.getTrackPublication(Track.Source.Camera);
      const screenTrack = localParticipant.getTrackPublication(Track.Source.ScreenShare);

      setIsMicEnabled(micTrack?.isMuted === false);
      setIsCameraEnabled(cameraTrack?.isMuted === false);
      setIsScreenSharing(screenTrack !== undefined);
    }
  }, [localParticipant, tracks]);

  const toggleMicrophone = async () => {
    if (localParticipant) {
      const enabled = !isMicEnabled;
      await localParticipant.setMicrophoneEnabled(enabled);
      setIsMicEnabled(enabled);
    }
  };

  const toggleCamera = async () => {
    if (localParticipant) {
      const enabled = !isCameraEnabled;
      await localParticipant.setCameraEnabled(enabled);
      setIsCameraEnabled(enabled);
    }
  };

  const toggleScreenShare = async () => {
    if (localParticipant) {
      if (isScreenSharing) {
        await localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
      } else {
        await localParticipant.setScreenShareEnabled(true);
        setIsScreenSharing(true);
      }
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <div className="flex items-center gap-4 px-8 py-4 bg-[#202124] rounded-full shadow-lg border border-gray-700/50">
        {/* Microphone Toggle */}
        <button
          onClick={toggleMicrophone}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all
            ${isMicEnabled
              ? 'bg-[#3c4043] hover:bg-[#5f6368] text-white'
              : 'bg-[#ea4335] hover:bg-[#d93025] text-white'
            }`}
          title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicEnabled ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
              <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.516.75.75 0 00-1.423-.474 8.528 8.528 0 01-2.817 3.845L13.41 12.11A6.003 6.003 0 0014 10V4a4 4 0 00-7.905-.707L3.28 2.22z" />
              <path d="M10 17c-2.878 0-5.356-1.72-6.465-4.197a.75.75 0 011.423-.474A6.003 6.003 0 0010 15.5a5.965 5.965 0 002.955-.778l-1.313-1.313A3.989 3.989 0 0110 14a4 4 0 01-4-4v-.879L4.168 7.289A5.98 5.98 0 004 10a6 6 0 006 6z" />
            </svg>
          )}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all
            ${isCameraEnabled
              ? 'bg-[#3c4043] hover:bg-[#5f6368] text-white'
              : 'bg-[#ea4335] hover:bg-[#d93025] text-white'
            }`}
          title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraEnabled ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          )}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={toggleScreenShare}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all
            ${isScreenSharing
              ? 'bg-[#1a73e8] hover:bg-[#1765cc] text-white'
              : 'bg-[#3c4043] hover:bg-[#5f6368] text-white'
            }`}
          title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-10 bg-gray-700/50" />

        {/* Leave/End Stream Button */}
        <button
          onClick={onLeave}
          className="w-14 h-14 rounded-full bg-[#ea4335] hover:bg-[#d93025] flex items-center justify-center transition-all text-white"
          title={isBroadcaster ? 'End stream' : 'Leave stream'}
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            <path d="M16.707 3.293a1 1 0 010 1.414L15.414 6l1.293 1.293a1 1 0 01-1.414 1.414L14 7.414l-1.293 1.293a1 1 0 11-1.414-1.414L12.586 6l-1.293-1.293a1 1 0 011.414-1.414L14 4.586l1.293-1.293a1 1 0 011.414 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
