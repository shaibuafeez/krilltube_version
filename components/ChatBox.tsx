'use client';

import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  type: 'normal' | 'super_chat' | 'system';
  donationAmount?: string;
  isDeleted: boolean;
  deletedBy?: string;
  createdAt: string;
}

interface ChatBoxProps {
  streamId: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  isModerator?: boolean;
  onSendMessage?: (message: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  messages?: ChatMessage[];
  isLoading?: boolean;
}

export function ChatBox({
  streamId,
  userId,
  userName,
  userAvatar,
  isModerator = false,
  onSendMessage,
  onDeleteMessage,
  messages = [],
  isLoading = false,
}: ChatBoxProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !userId || !userName || isSending) return;

    setIsSending(true);
    try {
      if (onSendMessage) {
        await onSendMessage(messageInput);
      } else {
        // Default API call
        await fetch('/api/live/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streamId,
            userId,
            userName,
            userAvatar,
            message: messageInput,
            type: 'normal',
          }),
        });
      }
      setMessageInput('');
    } catch (error) {
      console.error('[ChatBox] Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!isModerator || !userId) return;

    try {
      if (onDeleteMessage) {
        await onDeleteMessage(messageId);
      } else {
        // Default API call
        await fetch('/api/live/chat', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageId,
            streamId,
            userId,
          }),
        });
      }
    } catch (error) {
      console.error('[ChatBox] Failed to delete message:', error);
    }
  };

  const formatDonationAmount = (amount: string) => {
    // Convert MIST to SUI (1 SUI = 1,000,000,000 MIST)
    const sui = parseInt(amount) / 1_000_000_000;
    return sui.toFixed(2);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl
      shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
      outline outline-[3px] outline-offset-[-3px] outline-black
      overflow-hidden">

      {/* Chat Header */}
      <div className="px-4 py-3 bg-[#FFEEE5] border-b-[3px] border-black">
        <h3 className="text-lg font-bold text-black font-['Outfit']">
          Live Chat
        </h3>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-black/50 text-sm font-medium font-['Outfit']">
              No messages yet. Be the first to chat!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-xl transition-all
                ${msg.isDeleted
                  ? 'bg-gray-100 opacity-50'
                  : msg.type === 'super_chat'
                  ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-[2px] border-orange-400 shadow-[2px_2px_0px_0px_rgba(251,146,60,1)]'
                  : msg.type === 'system'
                  ? 'bg-blue-50 border-[2px] border-blue-300'
                  : 'bg-gray-50'
                }`}
            >
              {/* Message Header */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {/* User Avatar */}
                  {msg.userAvatar ? (
                    <img
                      src={msg.userAvatar}
                      alt={msg.userName}
                      className="w-6 h-6 rounded-full object-cover border-[1px] border-black"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-walrus-mint to-walrus-grape
                      flex items-center justify-center border-[1px] border-black">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}

                  {/* Username */}
                  <span className="text-sm font-bold text-black font-['Outfit']">
                    {msg.userName}
                  </span>

                  {/* Super Chat Badge */}
                  {msg.type === 'super_chat' && msg.donationAmount && (
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full
                      border-[1px] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      💎 {formatDonationAmount(msg.donationAmount)} SUI
                    </span>
                  )}
                </div>

                {/* Delete Button (Moderator Only) */}
                {isModerator && !msg.isDeleted && (
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded
                      border-[1px] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                      hover:bg-red-600 transition-colors"
                    title="Delete message"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Message Content */}
              <p className={`text-sm font-medium font-['Outfit'] break-words
                ${msg.isDeleted ? 'text-gray-400 italic' : 'text-black'}`}>
                {msg.isDeleted ? '[Message deleted by moderator]' : msg.message}
              </p>

              {/* Timestamp */}
              <p className="text-xs text-black/50 font-['Outfit'] mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      {userId && userName ? (
        <div className="p-4 border-t-[3px] border-black bg-[#FFEEE5]">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Send a message..."
              disabled={isSending}
              className="flex-1 px-4 py-3 bg-white rounded-xl
                border-[2px] border-black
                text-black placeholder-black/40
                font-['Outfit'] font-medium
                focus:outline-none focus:ring-2 focus:ring-walrus-mint
                disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
              className="px-6 py-3 bg-black text-white rounded-xl
                border-[2px] border-black
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                hover:shadow-[2px_2px_0_0_black]
                hover:translate-x-[1px]
                hover:translate-y-[1px]
                transition-all
                font-['Outfit'] font-bold
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t-[3px] border-black bg-gray-100">
          <p className="text-center text-sm text-black/50 font-medium font-['Outfit']">
            Connect your wallet to chat
          </p>
        </div>
      )}
    </div>
  );
}
