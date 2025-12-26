'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamId: string;
  creatorAddress: string;
  onDonationSuccess: (amount: string, message: string, txDigest: string) => void;
}

export default function DonationModal({
  isOpen,
  onClose,
  streamId,
  creatorAddress,
  onDonationSuccess,
}: DonationModalProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined donation amounts
  const quickAmounts = [0.1, 0.5, 1, 5, 10];

  const handleDonate = async () => {
    if (!currentAccount?.address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    if (!message.trim()) {
      alert('Please add a message with your donation');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const amountInMist = Math.floor(parseFloat(amount) * 1e9);

      // Create transaction to send SUI to creator
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
      tx.transferObjects([coin], creatorAddress);

      // Sign and execute transaction
      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            console.log('[Donation] Transaction successful:', result);

            // Save donation to database and create Super Chat message
            try {
              const response = await fetch('/api/live/donation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  streamId,
                  donorAddress: currentAccount.address,
                  donorName: `User-${currentAccount.address.slice(0, 8)}`,
                  amount: amountInMist.toString(),
                  message,
                  txDigest: result.digest,
                }),
              });

              if (response.ok) {
                const data = await response.json();
                onDonationSuccess(amountInMist.toString(), message, result.digest);
                onClose();
                setAmount('');
                setMessage('');
              } else {
                const error = await response.json();
                alert(error.error || 'Failed to record donation');
              }
            } catch (error) {
              console.error('[Donation] Failed to save donation:', error);
              alert('Donation sent but failed to record. Please contact support.');
            } finally {
              setIsSubmitting(false);
            }
          },
          onError: (error) => {
            console.error('[Donation] Transaction failed:', error);
            alert('Transaction failed. Please try again.');
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) {
      console.error('[Donation] Error creating transaction:', error);
      alert('Failed to create transaction. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white rounded-[32px]
        shadow-[5px_5px_0px_1px_rgba(0,0,0,1.00)]
        outline outline-[3px] outline-offset-[-3px] outline-black">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black font-['Outfit']">
            💰 Send Super Chat
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-10 h-10 rounded-full bg-red-600 text-white font-bold
              border-2 border-black
              hover:bg-red-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-black/70 mb-4 font-['Outfit']">
          Stand out in chat with a highlighted message! Your donation goes directly to the creator.
        </p>

        {/* Quick amount buttons */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-black mb-2 font-['Outfit']">
            Quick amounts:
          </p>
          <div className="flex gap-2 flex-wrap">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-full font-bold font-['Outfit']
                  border-2 border-black
                  transition-all
                  ${
                    amount === quickAmount.toString()
                      ? 'bg-[#0668A6] text-white'
                      : 'bg-white text-black hover:bg-[#FFEEE5]'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {quickAmount} SUI
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-black mb-2 font-['Outfit']">
            Amount (SUI):
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter custom amount..."
            className="w-full px-4 py-3 bg-cyan-500/20 rounded-[32px]
              border-[2px] border-black
              text-black placeholder-black/50
              outline-none text-base font-medium font-['Outfit']
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:border-[#0668A6] transition-colors"
          />
        </div>

        {/* Message input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-black mb-2 font-['Outfit']">
            Your message: *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
            maxLength={200}
            rows={3}
            placeholder="Add your message..."
            className="w-full px-4 py-3 bg-cyan-500/20 rounded-2xl
              border-[2px] border-black
              text-black placeholder-black/50
              outline-none text-base font-medium font-['Outfit']
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:border-[#0668A6] transition-colors
              resize-none"
          />
          <p className="text-xs text-black/50 mt-1 font-['Outfit']">
            {message.length}/200 characters
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-white rounded-[32px] text-black font-bold font-['Outfit']
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
            Cancel
          </button>
          <button
            onClick={handleDonate}
            disabled={isSubmitting || !amount || !message.trim()}
            className="flex-1 px-6 py-3 bg-[#0668A6] rounded-[32px] text-white font-bold font-['Outfit']
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
            {isSubmitting ? 'Sending...' : `Send ${amount || '0'} SUI`}
          </button>
        </div>
      </div>
    </div>
  );
}
