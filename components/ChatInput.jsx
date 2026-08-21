'use client';

import { useState } from 'react';

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Écrivez votre message..."
        disabled={disabled}
        className="flex-1 rounded-full px-4 py-2.5 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
        style={{
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          color: '#1a1a1a',
        }}
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow transition-colors disabled:cursor-not-allowed"
        style={{
          background: !value.trim() || disabled ? '#fda4af' : 'linear-gradient(135deg, #9f1239, #be123c)',
        }}
        aria-label="Envoyer"
      >
        <SendIcon />
      </button>
    </form>
  );
}
