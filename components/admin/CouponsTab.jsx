'use client';

import { useState, useEffect, useCallback } from 'react';
import { compressImage } from '@/lib/compressImage';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setCoupons(data.coupons ?? []);
    } catch {
      setError('Impossible de charger les coupons.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  function handleFileChange(e) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !description.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const image = await compressImage(file);
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim(), description: description.trim(), image }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Erreur lors de la publication.');
      }

      setLabel('');
      setDescription('');
      setFile(null);
      setPreview(null);
      fetchCoupons();
    } catch (err) {
      setError(err.message ?? 'Erreur lors de la publication.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce coupon ?')) return;
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    fetchCoupons();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-4 space-y-3"
        style={{ background: '#ffffff', border: '1px solid #fecdd3' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#d97706' }}>
          Publier un coupon (valable 24h)
        </p>

        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Libellé (ex: Betwinner — Combo du jour)"
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#1a1a1a' }}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description du coupon (matchs, cotes, etc.)"
          rows={3}
          required
          className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
          style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#1a1a1a' }}
        />

        <input type="file" accept="image/*" onChange={handleFileChange} required className="w-full text-sm" />

        {preview && <img src={preview} alt="Aperçu" className="rounded-xl max-h-40 object-cover" />}

        {error && <p className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #9f1239, #be123c)' }}
        >
          {submitting ? 'Publication…' : 'Publier'}
        </button>
      </form>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #fecdd3' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #fecdd3' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#d97706' }}>Coupons publiés</p>
        </div>

        {loading ? (
          <p className="text-sm text-center py-10" style={{ color: '#9ca3af' }}>Chargement…</p>
        ) : coupons.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: '#9ca3af' }}>Aucun coupon publié.</p>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #fff1f2' }}>
              <img src={c.image_data} alt={c.label ?? 'Coupon'} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {c.label && <p className="text-sm font-semibold truncate" style={{ color: '#9f1239' }}>{c.label}</p>}
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      color: c.is_active ? '#065f46' : '#991b1b',
                      background: c.is_active ? '#d1fae5' : '#fee2e2',
                    }}
                  >
                    {c.is_active ? 'Actif' : 'Expiré'}
                  </span>
                </div>
                <p className="text-xs truncate" style={{ color: '#374151' }}>{c.description}</p>
                <p className="text-[11px]" style={{ color: '#9ca3af' }}>
                  Publié le {formatDate(c.created_at)} · Expire le {formatDate(c.expires_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca' }}
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
