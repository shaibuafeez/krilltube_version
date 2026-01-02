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
    <div className="absolute bottom-20 md:bottom-24 right-4 md:right-6 pointer-events-auto z-10">
      {/* Single Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        title="Stream controls"
        className="w-12 h-12 rounded-full
          bg-white/50 backdrop-blur-sm
          shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
          outline-2 outline-black
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
          hover:translate-x-[1px]
          hover:translate-y-[1px]
          hover:bg-white/70
          transition-all
          flex items-center justify-center">
        {isExpanded ? (
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        )}
      </button>

      {/* Expanded Control Panel */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-56 bg-white/95 backdrop-blur-md rounded-2xl
          shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
          outline outline-2 outline-offset-[-2px] outline-black
          p-3 space-y-2 animate-in slide-in-from-bottom-4 duration-200">

          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            disabled={isLoading}
            className={`w-full px-3 py-2.5 rounded-xl
              text-sm font-semibold font-['Outfit']
              hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all
              flex items-center gap-3
              ${isCameraOn
                ? 'bg-[#FFEEE5] text-black'
                : 'bg-red-600 text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              {isCameraOn ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
                </>
              )}
            </svg>
            <span>{isCameraOn ? 'Camera On' : 'Camera Off'}</span>
          </button>

          {/* Mic Toggle */}
          <button
            onClick={toggleMicrophone}
            disabled={isLoading}
            className={`w-full px-3 py-2.5 rounded-xl
              text-sm font-semibold font-['Outfit']
              hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all
              flex items-center gap-3
              ${isMicOn
                ? 'bg-[#FFEEE5] text-black'
                : 'bg-red-600 text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              {isMicOn ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </>
              )}
            </svg>
            <span>{isMicOn ? 'Mic On' : 'Mic Off'}</span>
          </button>

          {/* Screen Share Toggle */}
          <button
            onClick={toggleScreenShare}
            disabled={isLoading}
            className={`w-full px-3 py-2.5 rounded-xl
              text-sm font-semibold font-['Outfit']
              hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all
              flex items-center gap-3
              ${isScreenSharing
                ? 'bg-purple-600 text-white'
                : 'bg-[#FFEEE5] text-black'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
            <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
          </button>

          {/* Invite Button - Only for broadcaster */}
          {isBroadcaster && (
            <>
              <div className="h-px bg-black/10 my-1" />
              <button
                onClick={() => setShowInviteForm(true)}
                className="w-full px-3 py-2.5 rounded-xl
                  bg-gradient-to-br from-[#0668A6] to-[#1AAACE]
                  text-white text-sm font-semibold font-['Outfit']
                  hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]
                  transition-all
                  flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                <span>Invite Viewer</span>
              </button>
            </>
          )}
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
