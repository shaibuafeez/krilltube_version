'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  creatorAddress: string;
  creatorName?: string;
}

export default function TipModal({
  isOpen,
  onClose,
  videoId,
  creatorAddress,
  creatorName,
}: TipModalProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const quickAmounts = [0.1, 0.5, 1, 5, 10];

  const handleTip = async () => {
    if (!currentAccount?.address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid tip amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const amountInMist = Math.floor(parseFloat(amount) * 1e9);

      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
      tx.transferObjects([coin], creatorAddress);

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            try {
              await fetch(`/api/v1/videos/${videoId}/tips`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tipperAddress: currentAccount.address,
                  tipperName: `User-${currentAccount.address.slice(0, 8)}`,
                  amount: amountInMist.toString(),
                  message: message.trim() || null,
                  txDigest: result.digest,
                  chain: 'sui',
                }),
              });
            } catch (error) {
              console.error('[Tip] Failed to record tip:', error);
            }

            setSuccess(true);
            setTimeout(() => {
              setSuccess(false);
              setAmount('');
              setMessage('');
              onClose();
            }, 2000);
          },
          onError: (error) => {
            console.error('[Tip] Transaction failed:', error);
            alert('Transaction failed. Please try again.');
          },
        }
      );
    } catch (error) {
      console.error('[Tip] Error:', error);
      alert('Failed to create transaction.');
    } finally {
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
            Tip {creatorName || 'Creator'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-10 h-10 rounded-full bg-red-600 text-white font-bold
              border-2 border-black
              hover:bg-red-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &times;
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">&#10003;</div>
            <p className="text-xl font-bold text-black font-['Outfit']">Tip sent!</p>
            <p className="text-sm text-black/60 font-['Outfit'] mt-1">
              {amount} SUI sent to {creatorName || 'creator'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-black/70 mb-4 font-['Outfit']">
              Show your appreciation! Tips go directly to the creator&apos;s wallet.
            </p>

            {/* Quick amounts */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-black mb-2 font-['Outfit']">
                Quick amounts:
              </p>
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map((qa) => (
                  <button
                    key={qa}
                    onClick={() => setAmount(qa.toString())}
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-full font-bold font-['Outfit']
                      border-2 border-black transition-all
                      ${amount === qa.toString()
                        ? 'bg-[#0668A6] text-white'
                        : 'bg-white text-black hover:bg-[#FFEEE5]'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {qa} SUI
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
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

            {/* Optional message */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-black mb-2 font-['Outfit']">
                Message (optional):
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                maxLength={200}
                rows={2}
                placeholder="Say something nice..."
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

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-white rounded-[32px] text-black font-bold font-['Outfit']
                  shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                  outline outline-2 outline-offset-[-2px] outline-black
                  hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                  hover:translate-x-[1px] hover:translate-y-[1px]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleTip}
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                className="flex-1 px-6 py-3 bg-[#0668A6] rounded-[32px] text-white font-bold font-['Outfit']
                  shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
                  outline outline-2 outline-offset-[-2px] outline-black
                  hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
                  hover:translate-x-[1px] hover:translate-y-[1px]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all"
              >
                {isSubmitting ? 'Sending...' : `Send ${amount || '0'} SUI`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
