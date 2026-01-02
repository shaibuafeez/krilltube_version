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

const EMOJI_OPTIONS = ['❤️', '👍', '😂', '🔥', '🎉', '😮', '👏', '💯'];

export default function LiveChat({ roomName, isBroadcaster = false, streamId, creatorAddress }: LiveChatProps) {
  const currentAccount = useCurrentAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [isSendingReaction, setIsSendingReaction] = useState(false);
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

  const sendReaction = async (emoji: string) => {
    if (!currentAccount?.address || isSendingReaction) return;

    setIsSendingReaction(true);
    setShowEmojiPanel(false);

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
      console.error('[LiveChat] Send reaction error:', err);
    } finally {
      setIsSendingReaction(false);
    }
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
    <div className="h-full flex flex-col gap-2">

      {/* No header - TikTok Live style */}

      {/* Messages Container - TikTok Live Style */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-1.5 flex flex-col justify-end"
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

              {/* Super Chat Message - Highlighted */}
              {msg.donationAmount && !msg.deleted ? (
                <div className="px-3 py-1.5
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
                  <div className="px-3 py-1.5
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
      <div className="p-2 relative">
        {/* Emoji Picker Panel - Appears above input */}
        {showEmojiPanel && (
          <div className="absolute bottom-full left-2 mb-2 bg-white rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] outline outline-2 outline-offset-[-2px] outline-black z-10">
            {/* Header with close button */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-700 font-['Outfit']">React</span>
              <button
                onClick={() => setShowEmojiPanel(false)}
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
        )}

        <div className="flex gap-1.5">
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
            className="flex-1 px-4 py-2.5 bg-gray-800/80 backdrop-blur-sm rounded-full
              text-white placeholder-white/60
              outline-none text-sm font-medium font-['Outfit']
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:bg-gray-800/90 transition-colors"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !currentAccount?.address}
            className="px-4 py-2.5 flex-shrink-0 bg-pink-500/90 backdrop-blur-sm rounded-full
              text-white font-semibold font-['Outfit'] text-sm
              hover:bg-pink-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            {isLoading ? '...' : 'Send'}
          </button>

          {/* Gift Icon Button - Only show for viewers, not broadcaster */}
          {!isBroadcaster && (
            <button
              type="button"
              onClick={() => setIsDonationModalOpen(true)}
              disabled={!currentAccount?.address}
              className="w-10 h-10 flex-shrink-0 bg-white/50
                backdrop-blur-sm rounded-full
                flex items-center justify-center
                hover:bg-white/70
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all"
              title="Send Gift"
            >
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </button>
          )}

          {/* Emoji Reaction Button - After Gift button */}
          <button
            type="button"
            onClick={() => setShowEmojiPanel(!showEmojiPanel)}
            disabled={!currentAccount?.address}
            className="w-10 h-10 flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="React with emoji"
          >
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
