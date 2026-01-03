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
  externalOpenDonation?: () => void;
}

export default function LiveChat({ roomName, isBroadcaster = false, streamId, creatorAddress, externalOpenDonation }: LiveChatProps) {
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

  // Expose functions to external handlers
  useEffect(() => {
    if (externalOpenDonation) {
      (window as any).__openDonationModal = () => setIsDonationModalOpen(true);
    }
    return () => {
      delete (window as any).__openDonationModal;
    };
  }, [externalOpenDonation]);

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

  // Generate avatar shade from userId (black and white)
  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-gray-700',
      'bg-gray-600',
      'bg-gray-800',
      'bg-gray-500',
      'bg-black',
      'bg-gray-900',
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Get initials from userName
  const getInitials = (userName: string) => {
    return userName.charAt(0).toUpperCase();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Container - Zoom Style */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center py-4 hidden md:flex">
            <p className="text-white/60 text-xs font-['Outfit'] px-3 py-1.5 bg-black/40 rounded-full backdrop-blur-sm">
              💬 Start chatting!
            </p>
          </div>
        ) : (
          messages.slice(-50).map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${msg.deleted ? 'opacity-40' : ''}`}
            >
              {/* User Avatar */}
              {!msg.deleted && (
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${getAvatarColor(msg.userId)} border-2 border-white/20`}>
                  <span className="text-white text-xs font-bold font-['Outfit']">
                    {getInitials(msg.userName)}
                  </span>
                </div>
              )}

              {/* Super Chat Message - White and Minimalistic */}
              {msg.donationAmount && !msg.deleted ? (
                <div className="px-3 py-1.5
                  bg-white/90 backdrop-blur-sm rounded-2xl
                  border border-white/20">
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-xs font-bold text-black font-['Outfit']">
                      {msg.userName}
                    </p>
                    <span className="text-xs font-semibold text-black/70 font-['Outfit']">
                      💰 {(parseInt(msg.donationAmount) / 1e9).toFixed(2)} SUI
                    </span>
                  </div>
                  <p className="text-sm text-black/80 font-['Outfit'] font-medium">
                    {msg.message}
                  </p>
                </div>
              ) : (
                /* Regular Message - Reduced Opacity */
                !msg.deleted && (
                  <div className="px-3 py-1.5
                    bg-black/40 backdrop-blur-sm rounded-2xl">
                    <p className="text-xs font-['Outfit']">
                      <span className="font-bold text-white/90">
                        {msg.userName}:
                      </span>
                      <span className="text-white/80 ml-1">
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

      {/* Message Input - Zoom Style */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              currentAccount?.address
                ? 'Type a message...'
                : 'Connect wallet to chat'
            }
            disabled={!currentAccount?.address || isLoading}
            maxLength={500}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
            className="flex-1 px-3 py-2 bg-[#2d2d2f] rounded-lg
              text-white placeholder-white/50 text-sm
              outline-none font-['Outfit']
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:ring-2 focus:ring-blue-500 transition-all"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !currentAccount?.address}
            className="px-4 py-2 shrink-0 bg-[#1a73e8] hover:bg-[#1765cc] rounded-lg
              text-white font-semibold font-['Outfit'] text-sm
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
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
