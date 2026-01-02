'use client';

import { useState } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { Track } from 'livekit-client';
import SendInvitationForm from './SendInvitationForm';

interface CoHostControlsProps {
  streamId: string;
  userId: string;
  isBroadcaster?: boolean;
}

export default function CoHostControls({ streamId, userId, isBroadcaster = false }: CoHostControlsProps) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const toggleCamera = async () => {
    if (!localParticipant) return;

    setIsLoading(true);
    try {
      await localParticipant.setCameraEnabled(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    } catch (error) {
      console.error('[CoHostControls] Camera toggle error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMicrophone = async () => {
    if (!localParticipant) return;

    setIsLoading(true);
    try {
      await localParticipant.setMicrophoneEnabled(!isMicOn);
      setIsMicOn(!isMicOn);
    } catch (error) {
      console.error('[CoHostControls] Mic toggle error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScreenShare = async () => {
    if (!localParticipant || !room) return;

    setIsLoading(true);
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        await localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
        console.log('[CoHostControls] Screen sharing stopped');

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
      } else {
        // Start screen sharing
        await localParticipant.setScreenShareEnabled(true);
        setIsScreenSharing(true);
        console.log('[CoHostControls] Screen sharing started');

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
      }
    } catch (error) {
      console.error('[CoHostControls] Screen share error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute bottom-6 right-6 pointer-events-auto z-10 flex flex-col gap-2 max-h-[calc(100%-3rem)] overflow-y-auto">
      {/* Main Controls - Always Visible */}
      <button
        onClick={toggleCamera}
        disabled={isLoading}
        title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        className={`w-12 h-12 rounded-full
          shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
          outline outline-2 outline-offset-[-2px] outline-black
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
          hover:translate-x-[1px]
          hover:translate-y-[1px]
          disabled:opacity-50 disabled:cursor-not-allowed
          opacity-80 hover:opacity-100
          transition-all
          flex items-center justify-center
          ${isCameraOn ? 'bg-white text-black' : 'bg-red-600 text-white'}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isCameraOn ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          )}
        </svg>
      </button>

      <button
        onClick={toggleMicrophone}
        disabled={isLoading}
        title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        className={`w-12 h-12 rounded-full
          shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
          outline outline-2 outline-offset-[-2px] outline-black
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
          hover:translate-x-[1px]
          hover:translate-y-[1px]
          disabled:opacity-50 disabled:cursor-not-allowed
          opacity-80 hover:opacity-100
          transition-all
          flex items-center justify-center
          ${isMicOn ? 'bg-white text-black' : 'bg-red-600 text-white'}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMicOn ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          )}
        </svg>
      </button>

      <button
        onClick={toggleScreenShare}
        disabled={isLoading}
        title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
        className={`w-12 h-12 rounded-full
          shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
          outline outline-2 outline-offset-[-2px] outline-black
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
          hover:translate-x-[1px]
          hover:translate-y-[1px]
          disabled:opacity-50 disabled:cursor-not-allowed
          opacity-80 hover:opacity-100
          transition-all
          flex items-center justify-center
          ${isScreenSharing ? 'bg-purple-600 text-white' : 'bg-white text-black'}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Invite Viewer Button - Only for broadcaster */}
      {isBroadcaster && (
        <button
          onClick={() => setShowInviteForm(true)}
          title="Invite viewer to join stream"
          className="w-12 h-12 rounded-full
            bg-white
            shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
            outline outline-2 outline-offset-[-2px] outline-black
            hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
            hover:translate-x-[1px]
            hover:translate-y-[1px]
            hover:bg-[#FFEEE5]
            opacity-80 hover:opacity-100
            transition-all
            flex items-center justify-center">
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </button>
      )}

      {/* More Options Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        title="More options"
        className="w-12 h-12 rounded-full
          bg-white
          shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
          outline outline-2 outline-offset-[-2px] outline-black
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
          hover:translate-x-[1px]
          hover:translate-y-[1px]
          hover:bg-[#FFEEE5]
          opacity-80 hover:opacity-100
          transition-all
          flex items-center justify-center">
        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {/* Expanded Options Panel */}
      {isExpanded && (
        <div className="absolute bottom-0 right-16 w-64 bg-white rounded-[24px]
          shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
          outline outline-[3px] outline-offset-[-3px] outline-black
          p-4 space-y-2">

          <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-black">
            <h3 className="text-sm font-bold text-black font-['Outfit']">Controls</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-6 h-6 rounded-full bg-[#FFEEE5]
                flex items-center justify-center
                hover:bg-red-100
                transition-colors">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <button
            onClick={toggleCamera}
            className="w-full px-4 py-2 bg-[#FFEEE5] rounded-2xl
              text-black text-sm font-medium font-['Outfit']
              hover:bg-white
              transition-colors
              flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}</span>
          </button>

          <button
            onClick={toggleMicrophone}
            className="w-full px-4 py-2 bg-[#FFEEE5] rounded-2xl
              text-black text-sm font-medium font-['Outfit']
              hover:bg-white
              transition-colors
              flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>{isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}</span>
          </button>

          <button
            onClick={toggleScreenShare}
            className="w-full px-4 py-2 bg-[#FFEEE5] rounded-2xl
              text-black text-sm font-medium font-['Outfit']
              hover:bg-white
              transition-colors
              flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
          </button>

          <div className="pt-2 border-t-2 border-black">
            <p className="text-xs text-black/60 font-['Outfit'] text-center">
              Co-Host Controls
            </p>
          </div>
        </div>
      )}

      {/* Invitation Form Modal */}
      {isBroadcaster && (
        <SendInvitationForm
          streamId={streamId}
          isOpen={showInviteForm}
          onClose={() => setShowInviteForm(false)}
        />
      )}
    </div>
  );
}
