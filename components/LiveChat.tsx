'use client';

import { useState, useEffect, useRef } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import DonationModal from './DonationModal';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  donationAmount?: string;
  createdAt: Date;
  deleted?: boolean;
}

interface LiveChatProps {
  roomName: string;
  isBroadcaster?: boolean;
  streamId: string;
  creatorAddress: string;
}

export default function LiveChat({ roomName, isBroadcaster = false, streamId, creatorAddress }: LiveChatProps) {
  const currentAccount = useCurrentAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch existing messages on mount and poll for updates
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/live/chat?streamId=${streamId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('[LiveChat] Failed to fetch messages:', error);
      }
    };

    fetchMessages();

    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);

    return () => clearInterval(interval);
  }, [streamId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;
    if (!currentAccount?.address) {
      alert('Please connect your wallet to chat');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/live/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          userId: currentAccount.address,
          userName: `User-${currentAccount.address.slice(0, 8)}`,
          message: inputMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Message will appear via polling
        setInputMessage('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('[LiveChat] Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!isBroadcaster) return;

    if (!confirm('Delete this message?')) return;

    try {
      const response = await fetch('/api/live/chat/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          deletedBy: currentAccount?.address,
        }),
      });

      if (response.ok) {
        // Deletion will appear via polling
        console.log('[LiveChat] Message deleted');
      }
    } catch (error) {
      console.error('[LiveChat] Failed to delete message:', error);
    }
  };

  const handleDonationSuccess = (amount: string, message: string, txDigest: string) => {
    console.log('[LiveChat] Donation successful:', { amount, message, txDigest });
    // The Super Chat message will appear via polling
  };

  return (
    <div className="h-full flex flex-col gap-2">

      {/* No header - TikTok Live style */}

      {/* Messages Container - TikTok Live Style */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-1.5 flex flex-col justify-end"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <p className="text-white/60 text-xs font-['Outfit'] px-3 py-1.5 bg-black/40 rounded-full backdrop-blur-sm">
              💬 Start chatting!
            </p>
          </div>
        ) : (
          messages.slice(-50).map((msg) => (
            <div
              key={msg.id}
              className={`group ${msg.deleted ? 'opacity-40' : ''}`}
            >
              {/* Super Chat Message - Highlighted */}
              {msg.donationAmount && !msg.deleted ? (
                <div className="inline-block max-w-[85%] px-3 py-1.5
                  bg-gradient-to-r from-yellow-400/95 to-orange-500/95
                  backdrop-blur-sm rounded-2xl">
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-xs font-bold text-black font-['Outfit']">
                      {msg.userName}
                    </p>
                    <span className="text-xs font-semibold text-black/80 font-['Outfit']">
                      💰 {(parseInt(msg.donationAmount) / 1e9).toFixed(2)} SUI
                    </span>
                  </div>
                  <p className="text-sm text-black font-['Outfit'] font-medium">
                    {msg.message}
                  </p>
                </div>
              ) : (
                /* Regular Message - Compact */
                !msg.deleted && (
                  <div className="inline-block max-w-[85%] px-3 py-1.5
                    bg-black/60 backdrop-blur-sm rounded-2xl">
                    <p className="text-xs font-['Outfit']">
                      <span className="font-bold text-white">
                        {msg.userName}:
                      </span>
                      <span className="text-white/90 ml-1">
                        {msg.message}
                      </span>
                    </p>
                  </div>
                )
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - TikTok Live Style */}
      <div className="p-3 space-y-2">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              currentAccount?.address
                ? 'Add comment...'
                : 'Connect wallet to chat'
            }
            disabled={!currentAccount?.address || isLoading}
            maxLength={500}
            className="flex-1 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full
              text-black placeholder-black/50
              outline-none text-sm font-medium font-['Outfit']
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || !currentAccount?.address}
            className="px-5 py-2 bg-white/90 backdrop-blur-sm rounded-full
              text-black font-semibold font-['Outfit'] text-sm
              hover:bg-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </form>

        {/* Super Chat Button - Compact TikTok Style */}
        <button
          onClick={() => setIsDonationModalOpen(true)}
          disabled={!currentAccount?.address}
          className="w-full px-4 py-2 bg-gradient-to-r from-yellow-400/90 to-orange-500/90
            backdrop-blur-sm rounded-full text-black font-semibold font-['Outfit'] text-sm
            hover:from-yellow-400 hover:to-orange-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all"
        >
          💰 Send Gift
        </button>
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        streamId={streamId}
        creatorAddress={creatorAddress}
        onDonationSuccess={handleDonationSuccess}
      />
    </div>
  );
}
