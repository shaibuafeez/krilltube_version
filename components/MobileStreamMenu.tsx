'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MobileStreamMenuProps {
  streamTitle?: string;
  streamDescription?: string;
  creatorId?: string;
  viewerCount?: number;
  isLive?: boolean;
  isBroadcaster?: boolean;
  onEndStream?: () => void;
}

export default function MobileStreamMenu({
  streamTitle,
  streamDescription,
  creatorId,
  viewerCount = 0,
  isLive = true,
  isBroadcaster = false,
  onEndStream,
}: MobileStreamMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Top Bar - Hamburger, LIVE badge, and Viewer count on same line */}
      <div className="md:hidden absolute top-4 left-0 right-0 z-50 pointer-events-auto px-4 flex items-center justify-between gap-2">
        {/* Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-9 h-9 bg-black/50 backdrop-blur-sm rounded-md
            flex items-center justify-center flex-shrink-0
            border border-white/20
            hover:bg-black/70 transition-all"
          aria-label="Menu"
        >
          {isMenuOpen ? (
            // Close icon
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Center spacer */}
        <div className="flex-1" />

        {/* LIVE Badge and Viewer Count */}
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-md
              flex items-center gap-1.5 border border-white/20">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-[10px] font-semibold font-['Outfit'] tracking-wide">
                LIVE
              </span>
            </div>
          )}

          {viewerCount !== undefined && (
            <div className="px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-md
              flex items-center gap-1.5 border border-white/20">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-white text-[10px] font-semibold font-['Outfit']">
                {viewerCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Menu Panel - Slide in from top on mobile */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-0 left-0 right-0 z-40 pointer-events-auto">
          <div className="bg-gradient-to-b from-black/95 via-black/90 to-transparent backdrop-blur-md
            p-4 pt-20 pb-8 space-y-4 animate-in slide-in-from-top duration-300">

            {/* Stream Info */}
            <div className="space-y-2">

              {streamTitle && (
                <h2 className="text-white text-lg font-bold font-['Outfit']">
                  {streamTitle}
                </h2>
              )}

              {streamDescription && (
                <p className="text-white/80 text-sm font-['Outfit']">
                  {streamDescription}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push('/');
                }}
                className="flex-1 px-4 py-2.5 bg-white/20 backdrop-blur-sm rounded-full
                  text-white font-semibold font-['Outfit'] text-sm
                  border-2 border-white/30
                  hover:bg-white/30 transition-all"
              >
                Back to Home
              </button>

              {isBroadcaster && onEndStream && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEndStream();
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600/90 backdrop-blur-sm rounded-full
                    text-white font-semibold font-['Outfit'] text-sm
                    border-2 border-black
                    hover:bg-red-600 transition-all"
                >
                  End Stream
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
