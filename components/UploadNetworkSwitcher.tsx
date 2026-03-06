'use client';

import { useState } from 'react';

/**
 * UploadNetworkSwitcher — Static "Walrus Testnet (Free)" label.
 * Mainnet option removed; all uploads go through testnet.
 */
export function UploadNetworkSwitcher() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        {/* Static Network Label */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium font-['Outfit'] text-black/70">
            Storage Network
          </label>
          <div className="pl-4 pr-6 py-2.5 bg-black rounded-[32px]
            shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
            outline outline-2 outline-offset-[-2px]
            text-white text-base font-semibold font-['Outfit']">
            Walrus Testnet (Free)
          </div>
        </div>

        {/* Info Icon */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(true)}
            className="w-8 h-8 rounded-full
              bg-white
              shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
              outline outline-1 outline-offset-[-1px] outline-black
              flex items-center justify-center
              hover:shadow-[1px_1px_0_0_black]
              hover:translate-x-[1px] hover:translate-y-[1px]
              transition-all"
            title="Learn more"
          >
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInfo(false)}
          />

          {/* Modal */}
          <div className="relative max-w-md w-full bg-[#FFEEE5] rounded-[32px]
            shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
            outline outline-[3px] outline-offset-[-3px] outline-black">
            <div className="p-6">
              {/* Close Button */}
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full
                  bg-white
                  shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                  outline outline-1 outline-offset-[-1px] outline-black
                  flex items-center justify-center
                  hover:shadow-[1px_1px_0_0_black]
                  hover:translate-x-[1px] hover:translate-y-[1px]
                  transition-all"
              >
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Header */}
              <h3 className="text-xl font-bold font-['Outfit'] text-black mb-4">
                Walrus Testnet Storage
              </h3>

              {/* Content */}
              <div className="space-y-4 text-sm font-['Outfit']">
                <div className="p-4 bg-white rounded-2xl
                  shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                  outline outline-2 outline-offset-[-2px] outline-[#1AAACE]">
                  <h4 className="font-bold text-black mb-2 text-base">Walrus Testnet (Free)</h4>
                  <ul className="space-y-1 text-black/70 ml-4">
                    <li>• Completely free to use</li>
                    <li>• Perfect for testing uploads</li>
                    <li>• Files may be wiped after some time (~100 days)</li>
                    <li>• All uploads use IOTA wallet for authentication</li>
                  </ul>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowInfo(false)}
                className="mt-6 w-full py-3 px-4 bg-[#EF4330] text-white rounded-[32px]
                  shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                  outline outline-2 outline-offset-[-2px] outline-white
                  font-bold font-['Outfit'] text-base
                  hover:shadow-[2px_2px_0_0_black]
                  hover:translate-x-[1px] hover:translate-y-[1px]
                  transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
