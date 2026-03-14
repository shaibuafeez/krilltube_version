'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletContext } from '@/lib/context/WalletContext';

export default function CreateLiveStreamPage() {
  const router = useRouter();
  const { address, isConnected } = useWalletContext();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateStream = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a stream title');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/live/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          creatorId: address,
          maxParticipants: 100,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create stream');
      }

      const data = await response.json();
      console.log('[CreateStream] Stream created:', data);

      // Redirect to broadcast page
      router.push(`/live/broadcast/${data.liveStream.roomName}`);
    } catch (error) {
      console.error('[CreateStream] Error:', error);
      alert('Failed to create live stream. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-['Outfit']">
            Go Live
          </h1>
          <p className="text-white/80 text-base font-['Outfit']">
            Set up your live stream and start broadcasting to your audience
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 bg-[#FFEEE5] rounded-[32px]
          shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
          outline outline-[3px] outline-offset-[-3px] outline-black
          flex flex-col gap-6">

          {/* Stream Title */}
          <div>
            <label className="block text-black text-sm font-bold font-['Outfit'] mb-2">
              Stream Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your stream title..."
              className="w-full px-4 py-3 bg-white rounded-xl
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                outline outline-2 outline-offset-[-2px] outline-black
                text-black placeholder-black/40
                font-['Outfit'] text-base
                focus:outline-[#1AAACE] focus:shadow-[3px_3px_0px_0px_#1AAACE]
                transition-all"
              maxLength={100}
              disabled={isCreating}
            />
            <div className="mt-1 text-xs text-black/60 font-['Outfit']">
              {title.length}/100 characters
            </div>
          </div>

          {/* Stream Description */}
          <div>
            <label className="block text-black text-sm font-bold font-['Outfit'] mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers what your stream is about..."
              rows={4}
              className="w-full px-4 py-3 bg-white rounded-xl
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                outline outline-2 outline-offset-[-2px] outline-black
                text-black placeholder-black/40
                font-['Outfit'] text-base
                focus:outline-[#1AAACE] focus:shadow-[3px_3px_0px_0px_#1AAACE]
                transition-all
                resize-none"
              maxLength={500}
              disabled={isCreating}
            />
            <div className="mt-1 text-xs text-black/60 font-['Outfit']">
              {description.length}/500 characters
            </div>
          </div>

          {/* Wallet Check */}
          {!isConnected && (
            <div className="p-4 bg-white rounded-xl
              shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
              outline outline-2 outline-offset-[-2px] outline-black">
              <p className="text-black text-sm font-semibold font-['Outfit']">
                Please connect your wallet to create a live stream
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              disabled={isCreating}
              className="flex-1 px-6 py-3 bg-white rounded-[32px]
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                outline outline-2 outline-offset-[-2px] outline-black
                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                hover:translate-x-[1px]
                hover:translate-y-[1px]
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition-all">
              <span className="text-black text-base font-bold font-['Outfit']">
                Cancel
              </span>
            </button>

            <button
              onClick={handleCreateStream}
              disabled={isCreating || !isConnected || !title.trim()}
              className="flex-1 px-6 py-3 bg-[#EF4330] rounded-[32px]
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                outline outline-2 outline-offset-[-2px] outline-black
                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                hover:translate-x-[1px]
                hover:translate-y-[1px]
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition-all">
              <span className="text-white text-base font-bold font-['Outfit']">
                {isCreating ? 'Creating Stream...' : 'Start Streaming'}
              </span>
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 p-6 bg-[#FFEEE5] rounded-[32px]
          shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
          outline outline-[3px] outline-offset-[-3px] outline-black">
          <h3 className="text-black text-lg font-bold font-['Outfit'] mb-4">
            Before you go live:
          </h3>
          <ul className="space-y-3">
            {[
              'Make sure you have a stable internet connection',
              'Test your camera and microphone before streaming',
              'Choose a well-lit and quiet environment',
              'Have engaging content prepared for your audience',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 flex-shrink-0 bg-[#0668A6] rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-black text-sm font-medium font-['Outfit']">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
