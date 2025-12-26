'use client';

import { useState, useEffect, useRef } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

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
}

export default function LiveChat({ roomName, isBroadcaster = false, streamId }: LiveChatProps) {
  const currentAccount = useCurrentAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch existing messages on mount
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
        setMessages((prev) => [...prev, data.message]);
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
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, deleted: true } : msg
          )
        );
      }
    } catch (error) {
      console.error('[LiveChat] Failed to delete message:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-[32px]
      shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
      outline outline-[3px] outline-offset-[-3px] outline-black
      overflow-hidden">

      {/* Chat Header */}
      <div className="p-4 bg-[#0668A6] border-b-[3px] border-black">
        <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
          💬 Live Chat
          <span className="text-sm font-normal text-white/80">
            ({messages.filter(m => !m.deleted).length})
          </span>
        </h3>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFEEE5]/30"
        style={{ maxHeight: 'calc(100% - 140px)' }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-black/50 text-sm font-['Outfit']">
              No messages yet. Be the first to chat!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`group ${msg.deleted ? 'opacity-50' : ''}`}
            >
              {/* Super Chat Message */}
              {msg.donationAmount && !msg.deleted ? (
                <div className="p-3 rounded-2xl
                  bg-gradient-to-r from-yellow-400 to-orange-500
                  border-[3px] border-black
                  shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full
                        bg-gradient-to-br from-walrus-mint to-walrus-grape
                        flex items-center justify-center
                        border-2 border-black text-xs font-bold">
                        {msg.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black font-['Outfit']">
                          {msg.userName}
                        </p>
                        <p className="text-xs font-semibold text-black/70 font-['Outfit']">
                          💰 {(parseInt(msg.donationAmount) / 1e9).toFixed(2)} SUI
                        </p>
                      </div>
                    </div>
                    {isBroadcaster && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity
                          text-xs px-2 py-1 bg-red-600 text-white rounded-full
                          border-2 border-black font-['Outfit'] font-semibold
                          hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-base text-black font-['Outfit'] font-semibold">
                    {msg.message}
                  </p>
                </div>
              ) : (
                /* Regular Message */
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full
                    bg-gradient-to-br from-[#0668A6] to-[#1AAACE]
                    flex items-center justify-center flex-shrink-0
                    border-2 border-black text-xs font-bold text-white">
                    {msg.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="text-sm font-bold text-black font-['Outfit']">
                        {msg.userName}
                      </p>
                      <p className="text-xs text-black/50 font-['Outfit']">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {isBroadcaster && !msg.deleted && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity
                            text-xs px-2 py-0.5 bg-red-600 text-white rounded-full
                            border border-black font-['Outfit'] font-semibold
                            hover:bg-red-700"
                        >
                          Del
                        </button>
                      )}
                    </div>
                    {msg.deleted ? (
                      <p className="text-sm text-black/40 italic font-['Outfit']">
                        Message deleted
                      </p>
                    ) : (
                      <p className="text-sm text-black font-['Outfit'] break-words">
                        {msg.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t-[3px] border-black bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              currentAccount?.address
                ? 'Send a message...'
                : 'Connect wallet to chat'
            }
            disabled={!currentAccount?.address || isLoading}
            maxLength={500}
            className="flex-1 px-4 py-3 bg-cyan-500/20 rounded-[32px]
              border-[2px] border-black
              text-black placeholder-black/50
              outline-none text-sm font-medium font-['Outfit']
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:border-[#0668A6] transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || !currentAccount?.address}
            className="px-6 py-3 bg-[#0668A6] rounded-[32px] text-white font-bold font-['Outfit']
              shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
              outline outline-2 outline-offset-[-2px] outline-black
              hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
              hover:translate-x-[1px]
              hover:translate-y-[1px]
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
              disabled:hover:translate-x-0
              disabled:hover:translate-y-0
              transition-all"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
