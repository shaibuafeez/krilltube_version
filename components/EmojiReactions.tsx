'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface Reaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
  userId: string;
}

interface EmojiReactionsProps {
  streamId: string;
  roomName: string;
}

const EMOJI_OPTIONS = ['❤️', '👍', '😂', '🔥', '🎉', '😮', '👏', '💯'];

export default function EmojiReactions({ streamId, roomName }: EmojiReactionsProps) {
  const currentAccount = useCurrentAccount();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Poll for new reactions every second
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/live/reactions?streamId=${streamId}&since=${Date.now() - 3000}`);

        if (response.ok) {
          const data = await response.json();

          // Add new reactions with random positions
          const newReactions = data.reactions.map((reaction: any) => ({
            id: reaction.id,
            emoji: reaction.emoji,
            x: Math.random() * 80 + 10, // Random x position (10-90%)
            y: 100, // Start from bottom
            userId: reaction.userId,
          }));

          setReactions(prev => [...prev, ...newReactions]);

          // Remove reactions after animation completes (3 seconds)
          setTimeout(() => {
            setReactions(prev => prev.filter(r => !newReactions.find(nr => nr.id === r.id)));
          }, 3000);
        }
      } catch (err) {
        console.error('[EmojiReactions] Fetch error:', err);
      }
    };

    const interval = setInterval(fetchReactions, 1000);
    return () => clearInterval(interval);
  }, [streamId]);

  const sendReaction = async (emoji: string) => {
    if (!currentAccount?.address || isSending) return;

    setIsSending(true);

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

      // Add immediate visual feedback
      const newReaction: Reaction = {
        id: `local-${Date.now()}`,
        emoji,
        x: Math.random() * 80 + 10,
        y: 100,
        userId: currentAccount.address,
      };

      setReactions(prev => [...prev, newReaction]);

      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== newReaction.id));
      }, 3000);
    } catch (err) {
      console.error('[EmojiReactions] Send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Reactions Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {reactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute animate-float-up"
            style={{
              left: `${reaction.x}%`,
              bottom: '0',
              fontSize: '3rem',
              animation: 'float-up 3s ease-out forwards',
            }}
          >
            {reaction.emoji}
          </div>
        ))}
      </div>

      {/* Reaction Button - Bottom left */}
      <div className="absolute bottom-6 left-6 pointer-events-auto z-30">
        {showPanel ? (
          // Emoji Selection Panel
          <div className="flex flex-col gap-2 items-end">
            <div className="grid grid-cols-4 gap-2 p-3 bg-white rounded-[24px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] outline outline-2 outline-offset-[-2px] outline-black">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendReaction(emoji)}
                  disabled={isSending}
                  className="w-12 h-12 rounded-full bg-[#FFEEE5] shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)] outline outline-1 outline-offset-[-1px] outline-black hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1.00)] hover:translate-x-[1px] hover:translate-y-[1px] hover:scale-110 disabled:opacity-50 transition-all flex items-center justify-center text-2xl">
                  {emoji}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowPanel(false)}
              className="w-12 h-12 rounded-full bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] outline outline-2 outline-offset-[-2px] outline-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)] hover:translate-x-[1px] hover:translate-y-[1px] opacity-80 hover:opacity-100 transition-all flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          // Emoji Button - White minimalistic style
          <button
            onClick={() => setShowPanel(true)}
            title="React with emoji"
            className="w-12 h-12 rounded-full bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] outline outline-2 outline-offset-[-2px] outline-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)] hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#FFEEE5] opacity-80 hover:opacity-100 transition-all flex items-center justify-center">
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-40vh) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(-80vh) scale(0.8);
            opacity: 0;
          }
        }

        .animate-float-up {
          animation: float-up 3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
