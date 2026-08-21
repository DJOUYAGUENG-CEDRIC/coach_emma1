'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import ChatBubble from '@/components/ChatBubble';
import AudioMessage from '@/components/AudioMessage';
import PlatformsCard from '@/components/PlatformsCard';
import QuickReplies from '@/components/QuickReplies';
import ChatInput from '@/components/ChatInput';
import { WELCOME_MESSAGE, AUDIO_URL } from '@/lib/config';
import { sendMessage } from '@/services/chatApi';

function getSessionId() {
  const key = 'ce1_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(key, id); }
  return id;
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function handleSend(text) {
    if (!text.trim() || isLoading) return;
    const currentHistory = history;

    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text }]);
    setIsLoading(true);

    try {
      const { reply, coupons } = await sendMessage(text, currentHistory.slice(-20), sessionIdRef.current);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'assistant', text: reply, coupons },
      ]);
      setHistory((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'assistant', text: "Une erreur s'est produite. Veuillez réessayer." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="flex flex-col h-dvh max-w-md mx-auto overflow-hidden"
      style={{ background: '#fff1f2' }}
    >
      <Header />

      <main className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-3">
        <ChatBubble sender="assistant" text={WELCOME_MESSAGE} />
        <AudioMessage src={AUDIO_URL} />
        <QuickReplies onSelect={handleSend} disabled={isLoading} />

        {messages.map((msg) => (
          <ChatBubble key={msg.id} sender={msg.sender} text={msg.text} coupons={msg.coupons} />
        ))}

        {isLoading && (
          <ChatBubble sender="assistant">
            <span className="flex gap-1 items-center py-0.5">
              <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0ms]" style={{ background: '#fecdd3' }} />
              <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: '#fecdd3' }} />
              <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: '#fecdd3' }} />
            </span>
          </ChatBubble>
        )}

        <div ref={bottomRef} />
      </main>

      <div
        className="shrink-0"
        style={{
          background: '#fff1f2',
          borderTop: '1px solid #fecdd3',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <PlatformsCard />
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
