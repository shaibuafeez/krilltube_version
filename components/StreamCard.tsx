'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface StreamCardProps {
  id: string;
  roomName: string;
  title: string;
  description?: string;
  creator?: string;
  creatorAddress?: string;
  creatorAvatar?: string;
  status: 'scheduled' | 'live' | 'ended';
  viewerCount?: number;
  startedAt?: Date | string;
  variant?: 'default' | 'featured';
}

export function StreamCard({
  id,
  roomName,
  title,
  description,
  creator = 'Anonymous',
  creatorAddress,
  creatorAvatar,
  status,
  viewerCount = 0,
  startedAt,
  variant = 'default',
}: StreamCardProps) {
  const router = useRouter();
  const [isPulsing, setIsPulsing] = useState(status === 'live');

  useEffect(() => {
    setIsPulsing(status === 'live');
  }, [status]);

  const getStatusBadge = () => {
    switch (status) {
      case 'live':
        return {
          label: 'LIVE',
          bgColor: 'bg-red-600',
          textColor: 'text-white',
          icon: '🔴',
          pulse: true,
        };
      case 'scheduled':
        return {
          label: 'Upcoming',
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          icon: '📅',
          pulse: false,
        };
      case 'ended':
        return {
          label: 'Ended',
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
          icon: '⏸️',
          pulse: false,
        };
    }
  };

  const badge = getStatusBadge();
  const formattedViewers = viewerCount >= 1000
    ? `${(viewerCount / 1000).toFixed(1)}K watching`
    : `${viewerCount} watching`;

  if (variant === 'featured') {
    return (
      <Link
        href={`/live/watch/${roomName}`}
        className="group block relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#EF4330] via-[#1AAACE] to-[#0668A6] aspect-[16/9] transition-transform hover:scale-[1.02]
          shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
          outline outline-[3px] outline-offset-[-3px] outline-black"
      >
        {/* Animated gradient overlay for live streams */}
        {status === 'live' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        )}

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-between">
          {/* Top badges */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 ${badge.bgColor} ${badge.textColor} text-sm font-bold rounded-full
                border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                ${badge.pulse ? 'animate-pulse' : ''}`}>
                {badge.icon} {badge.label}
              </span>
              {status === 'live' && (
                <span className="px-3 py-1.5 bg-white/90 text-black text-sm font-semibold rounded-full
                  border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  👁️ {formattedViewers}
                </span>
              )}
            </div>
          </div>

          {/* Title and creator info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 drop-shadow-lg">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-white/80 mb-3 line-clamp-1">
                {description}
              </p>
            )}
            <div className="flex items-center gap-3 text-sm text-white/90">
              <div className="flex items-center gap-2">
                {/* Creator Avatar */}
                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-white/20">
                  {creatorAvatar ? (
                    <img
                      src={creatorAvatar}
                      alt={creator}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-walrus-mint to-walrus-grape">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Creator Name */}
                {creatorAddress ? (
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/profile/${creatorAddress}`);
                    }}
                    className="font-medium hover:underline cursor-pointer"
                  >
                    {creator}
                  </span>
                ) : (
                  <span className="font-medium">{creator}</span>
                )}
              </div>
            </div>
          </div>

          {/* Play/Watch button */}
          <div className="absolute bottom-6 right-6">
            <div className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-xl border-2 border-black">
              <svg
                className="w-5 h-5 text-black ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/live/watch/${roomName}`}
      className="group block cursor-pointer p-3 rounded-xl border-b border-walrus-mint hover:bg-background-elevated/50 transition-all"
    >
      {/* Thumbnail/Preview */}
      <div className="relative aspect-video bg-gradient-to-br from-[#0668A6] to-[#1AAACE] rounded-xl overflow-hidden mb-3">
        {/* Animated gradient for live streams */}
        {status === 'live' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 ${badge.bgColor} ${badge.textColor} text-xs font-bold rounded
            border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            ${badge.pulse ? 'animate-pulse' : ''}`}>
            {badge.icon} {badge.label}
          </span>
        </div>

        {/* Viewer count (only for live streams) */}
        {status === 'live' && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/90 text-white text-xs font-semibold rounded
            border border-white shadow-[1px_1px_0px_0px_rgba(255,255,255,0.3)]">
            👁️ {formattedViewers}
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center
            group-hover:bg-white transition-all group-hover:scale-110
            border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <svg
              className="w-7 h-7 text-black ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stream info */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground line-clamp-2 leading-tight">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-text-muted line-clamp-1">
            {description}
          </p>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {/* Creator Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              {creatorAvatar ? (
                <img
                  src={creatorAvatar}
                  alt={creator}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-walrus-mint to-walrus-grape">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            {/* Creator Name */}
            <div className="flex-1 min-w-0">
              {creatorAddress ? (
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/profile/${creatorAddress}`);
                  }}
                  className="text-sm text-text-muted hover:text-walrus-mint transition-colors truncate block cursor-pointer"
                >
                  {creator}
                </span>
              ) : (
                <div className="text-sm text-text-muted truncate">{creator}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
