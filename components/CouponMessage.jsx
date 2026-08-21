'use client';

import { useState } from 'react';

function formatExpiry(expiresAt) {
  const d = new Date(expiresAt);
  const isActive = d > new Date();
  const label = d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  return { isActive, label };
}

function getExtension(dataUrl) {
  const match = /^data:image\/(\w+);/.exec(dataUrl ?? '');
  return (match ? match[1] : 'jpg').replace('jpeg', 'jpg');
}

function ZoomIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function DownloadIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="1" y1="1" x2="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="17" y1="1" x2="1" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function CouponMessage({ coupon }) {
  const { isActive, label } = formatExpiry(coupon.expiresAt);
  const [expanded, setExpanded] = useState(false);
  const fileName = `coupon-${coupon.id}.${getExtension(coupon.image)}`;

  return (
    <>
      <div className="rounded-xl overflow-hidden mb-2 last:mb-0" style={{ border: '1px solid #fecdd3' }}>
        <div className="relative w-full">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full block"
            style={{ cursor: 'zoom-in' }}
            aria-label="Agrandir le coupon"
          >
            <img
              src={coupon.image}
              alt={coupon.label ?? 'Coupon'}
              className="w-full block"
              style={{ maxHeight: 360, objectFit: 'cover' }}
            />
          </button>
          <a
            href={coupon.image}
            download={fileName}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 right-11 w-7 h-7 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            aria-label="Télécharger le coupon"
            title="Télécharger"
          >
            <DownloadIcon />
          </a>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            aria-label="Agrandir le coupon"
          >
            <ZoomIcon />
          </button>
        </div>
        <div className="px-3 py-2" style={{ background: '#fff1f2' }}>
          {coupon.label && (
            <p className="text-xs font-bold mb-0.5" style={{ color: '#9f1239' }}>{coupon.label}</p>
          )}
          <p className="text-xs" style={{ color: '#374151' }}>{coupon.description}</p>
          <p
            className="text-[10px] font-semibold mt-1 inline-block px-2 py-0.5 rounded-full"
            style={{
              color: isActive ? '#065f46' : '#991b1b',
              background: isActive ? '#d1fae5' : '#fee2e2',
            }}
          >
            {isActive ? `Valable jusqu'à ${label}` : `Expiré (${label})`}
          </p>
        </div>
      </div>

      {expanded && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Fermer l'aperçu du coupon"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', cursor: 'zoom-out' }}
          onClick={() => setExpanded(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setExpanded(false); }}
        >
          <a
            href={coupon.image}
            download={fileName}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            aria-label="Télécharger le coupon"
            title="Télécharger"
          >
            <DownloadIcon size={18} />
          </a>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            aria-label="Fermer"
          >
            <CloseIcon />
          </button>
          <img
            src={coupon.image}
            alt={coupon.label ?? 'Coupon'}
            className="max-w-full max-h-full rounded-lg"
            style={{ objectFit: 'contain' }}
          />
        </div>
      )}
    </>
  );
}
