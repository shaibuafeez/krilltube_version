'use client';

import { useState, useEffect } from 'react';

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

export default function EmojiReactions({ streamId, roomName }: EmojiReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  // Poll for new reactions every second
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/live/reactions?streamId=${streamId}&since=${Date.now() - 3000}`);

        if (response.ok) {
          const data = await response.json();

          // Filter out reactions we've already seen
          const unseenReactions = data.reactions.filter((r: any) => !seenIds.has(r.id));

          if (unseenReactions.length === 0) return;

          // Add new reactions with random positions
          const newReactions = unseenReactions.map((reaction: any) => ({
            id: reaction.id,
            emoji: reaction.emoji,
            x: Math.random() * 80 + 10, // Random x position (10-90%)
            y: 100, // Start from bottom
            userId: reaction.userId,
          }));

          // Mark these IDs as seen
          setSeenIds(prev => {
            const updated = new Set(prev);
            newReactions.forEach((r: Reaction) => updated.add(r.id));
            return updated;
          });

          setReactions(prev => [...prev, ...newReactions]);

          // Remove reactions after animation completes (3 seconds)
          setTimeout(() => {
            setReactions(prev => prev.filter(r => !newReactions.find((nr: Reaction) => nr.id === r.id)));
          }, 3000);

          // Clean up seen IDs after 5 seconds (they won't be returned by API anymore)
          setTimeout(() => {
            setSeenIds(prev => {
              const updated = new Set(prev);
              newReactions.forEach((r: Reaction) => updated.delete(r.id));
              return updated;
            });
          }, 5000);
        }
      } catch (err) {
        console.error('[EmojiReactions] Fetch error:', err);
      }
    };

    const interval = setInterval(fetchReactions, 1000);
    return () => clearInterval(interval);
  }, [streamId, seenIds]);

  return (
    <>
      {/* Floating Reactions Overlay - Only the animations, no button */}
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
