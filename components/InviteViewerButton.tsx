'use client';

import { useState } from 'react';
import SendInvitationForm from './SendInvitationForm';

interface InviteViewerButtonProps {
  streamId: string;
}

export default function InviteViewerButton({ streamId }: InviteViewerButtonProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowInviteForm(true)}
        title="Invite viewer to join stream"
        className="w-12 h-12 rounded-full
          bg-white
          shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]
          outline outline-2 outline-offset-[-2px] outline-black
          hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)]
          hover:translate-x-[1px]
          hover:translate-y-[1px]
          hover:bg-[#FFEEE5]
          opacity-80 hover:opacity-100
          transition-all
          flex items-center justify-center">
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      </button>

      <SendInvitationForm
        streamId={streamId}
        isOpen={showInviteForm}
        onClose={() => setShowInviteForm(false)}
      />
    </>
  );
}
