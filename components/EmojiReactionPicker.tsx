'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface EmojiReactionPickerProps {
  streamId: string;
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_OPTIONS = ['❤️', '👍', '😂', '🔥', '🎉', '😮', '👏', '💯'];

export default function EmojiReactionPicker({
  streamId,
  isOpen,
  onClose,
}: EmojiReactionPickerProps) {
  const currentAccount = useCurrentAccount();
  const [isSendingReaction, setIsSendingReaction] = useState(false);

  const sendReaction = async (emoji: string) => {
    if (!currentAccount?.address || isSendingReaction) return;

    setIsSendingReaction(true);
    onClose();

    try {
      const response = await fetch('/api/live/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          userId: currentAccount.address,
          emoji,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reaction');
      }
    } catch (err) {
      console.error('[EmojiReactionPicker] Send reaction error:', err);
    } finally {
      setIsSendingReaction(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop to close on click outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Emoji Picker Panel - Appears above control bar */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] outline outline-2 outline-offset-[-2px] outline-black z-50">
        {/* Header with close button */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
          <span className="text-xs font-semibold text-gray-700 font-['Outfit']">React</span>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
            title="Close"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Emoji grid */}
        <div className="p-2">
          <div className="grid grid-cols-4 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                disabled={isSendingReaction}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center justify-center text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
