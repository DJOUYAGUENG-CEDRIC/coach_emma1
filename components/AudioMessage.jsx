'use client';

import { useState, useRef, useEffect } from 'react';

const SPEEDS = [1, 1.5, 2];

function formatTime(sec) {
  if (!sec || Number.isNaN(sec) || !Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
    </svg>
  );
}

export default function AudioMessage({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('durationchange', onLoaded);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('durationchange', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { try { await audio.play(); setIsPlaying(true); } catch { /* bloqué */ } }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = (Number(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cycleSpeed = () => {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const trackBg = `linear-gradient(to right, #9f1239 ${progress}%, #fecdd3 ${progress}%)`;

  return (
    <div className="flex justify-start">
      <div
        className="rounded-2xl px-3 py-3 w-72 shadow-sm"
        style={{ background: '#ffffff', border: '1px solid #fecdd3', borderTopLeftRadius: '4px' }}
      >
        <audio ref={audioRef} src={src} preload="metadata">
          <track kind="captions" />
        </audio>

        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="rounded-full p-1 text-white shrink-0" style={{ background: '#9f1239' }}>
            <MicIcon />
          </div>
          <span className="text-xs font-medium" style={{ color: '#9f1239' }}>Message vocal</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={togglePlay}
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow"
            style={{ background: 'linear-gradient(135deg, #9f1239, #be123c)' }}
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <input
              type="range"
              min="0" max="100"
              value={progress}
              onChange={handleSeek}
              className="audio-range w-full"
              style={{ background: trackBg }}
              aria-label="Position de lecture"
            />
            <div className="flex justify-between text-xs tabular-nums" style={{ color: '#374151' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={cycleSpeed}
            className="shrink-0 text-xs font-bold rounded-md px-2 py-1 min-w-9 text-center"
            style={{ color: '#d97706', background: '#fef3c7' }}
            aria-label="Vitesse de lecture"
          >
            {SPEEDS[speedIndex]}x
          </button>
        </div>
      </div>
    </div>
  );
}
