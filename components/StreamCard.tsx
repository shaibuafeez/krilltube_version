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
        className="group block"
      >
        <div className="w-full p-5 bg-white rounded-[32px]
          shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
          outline outline-[3px] outline-offset-[-3px] outline-black
          hover:bg-[#FFEEE5] hover:shadow-[6px_6px_0_0_black]
          hover:translate-x-[-1px] hover:translate-y-[-1px]
          transition-all cursor-pointer">

          {/* Thumbnail Preview */}
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-4
            shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
            border-[2px] border-black
            bg-gradient-to-br from-[#0668A6] to-[#1AAACE]">

            {/* Animated shimmer for live streams */}
            {status === 'live' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            )}

            {/* Badges Row */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 ${badge.bgColor} ${badge.textColor} text-sm font-bold rounded-full
                  border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  font-['Outfit'] ${badge.pulse ? 'animate-pulse' : ''}`}>
                  {badge.icon} {badge.label}
                </span>
                {status === 'live' && (
                  <span className="px-3 py-1.5 bg-white text-black text-sm font-bold rounded-full
                    border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-['Outfit']">
                    👁️ {formattedViewers}
                  </span>
                )}
              </div>
            </div>

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center
                border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                group-hover:bg-white group-hover:scale-110 transition-all">
                <svg className="w-7 h-7 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Stream Info */}
          <div className="flex items-start gap-3">
            {/* Creator Avatar */}
            <div className="flex-shrink-0">
              {creatorAvatar ? (
                <img
                  src={creatorAvatar}
                  alt={creator}
                  className="w-10 h-10 rounded-full object-cover border-2 border-black"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-walrus-mint to-walrus-grape
                  flex items-center justify-center border-2 border-black">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-black mb-1 line-clamp-2 font-['Outfit']">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-black/70 mb-2 line-clamp-1 font-['Outfit']">
                  {description}
                </p>
              )}
              <div className="text-sm text-black/60 font-semibold font-['Outfit']">
                {creatorAddress ? (
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/profile/${creatorAddress}`);
                    }}
                    className="hover:text-walrus-mint cursor-pointer transition-colors"
                  >
                    {creator}
                  </span>
                ) : (
                  creator
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant - matches VideoCard design
  return (
    <Link href={`/live/watch/${roomName}`}>
      <div className="w-full p-4 bg-white rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] outline outline-[1.34px] outline-offset-[-1.34px] outline-black flex flex-col gap-1.5 overflow-hidden hover:bg-[#FFEEE5] hover:shadow-[5px_5px_0_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:scale-105 transition-all cursor-pointer">
        <div className="w-full relative flex flex-col justify-start items-start gap-4">
          {/* Thumbnail/Preview */}
          <div className="relative w-full h-56">
            <div className="w-full h-56 rounded-xl shadow-[2.0129659175872803px_2.0129659175872803px_0px_0px_rgba(0,0,0,1.00)] border-[1.34px] border-black object-cover bg-gradient-to-br from-[#0668A6] to-[#1AAACE] overflow-hidden">
              {/* Animated gradient for live streams */}
              {status === 'live' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              )}

              {/* Status badge */}
              <div className="absolute top-2 left-2 z-10">
                <span className={`px-2 py-1 ${badge.bgColor} ${badge.textColor} text-xs font-bold rounded
                  border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  ${badge.pulse ? 'animate-pulse' : ''}`}>
                  {badge.icon} {badge.label}
                </span>
              </div>

              {/* Viewer count (only for live streams) */}
              {status === 'live' && (
                <div className="p-1 absolute bottom-2 right-2 bg-white rounded outline outline-1 outline-offset-[-1px] outline-black inline-flex justify-center items-center z-10">
                  <div className="text-black text-sm font-semibold font-['Outfit'] [text-shadow:_0px_3px_7px_rgb(0_0_0_/_0.25)]">
                    👁️ {formattedViewers}
                  </div>
                </div>
              )}

              {/* Play Button Overlay */}
              <div className="w-8 h-8 p-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 rounded-2xl inline-flex justify-center items-center z-10">
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Stream Info */}
          <div className="w-full flex flex-col justify-start items-start gap-2">
            {/* Creator Info with Avatar */}
            <div className="flex items-center gap-2">
              {/* Creator Avatar */}
              {creatorAvatar ? (
                <img
                  src={creatorAvatar}
                  alt={creator}
                  className="w-8 h-8 rounded-full object-cover border border-black"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-walrus-mint to-walrus-grape flex items-center justify-center border border-black">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              {/* Creator Name */}
              <div className="text-black text-sm font-semibold font-['Outfit'] [text-shadow:_0px_3px_7px_rgb(0_0_0_/_0.25)]">
                {creatorAddress ? (
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/profile/${creatorAddress}`);
                    }}
                    className="hover:text-walrus-mint cursor-pointer"
                  >
                    {creator}
                  </span>
                ) : (
                  creator
                )}
              </div>
            </div>

            <div className="w-full inline-flex justify-between items-start gap-2">
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                <div className="text-black text-lg font-bold font-['Outfit'] line-clamp-2">{title}</div>
                {description && (
                  <div className="text-black/70 text-sm font-medium font-['Outfit'] line-clamp-1">
                    {description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
