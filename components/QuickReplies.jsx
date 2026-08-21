'use client';

const QUESTIONS = [
  'Quel est le score exact du jour ?',
  'Comment télécharger le coupon ?',
];

export default function QuickReplies({ onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2 px-1">
      {QUESTIONS.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="text-xs font-medium px-3 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: '#ffffff', border: '1px solid #fecdd3', color: '#9f1239' }}
        >
          {q}
        </button>
      ))}
    </div>
  );
}
