'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setError('Mot de passe incorrect.');
      }
    } catch {
      setError('Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex items-center justify-center h-dvh"
      style={{ background: '#fff1f2' }}
    >
      <div
        className="w-full max-w-sm mx-4 p-6 rounded-2xl shadow-lg"
        style={{ background: '#ffffff', border: '1px solid #fecdd3' }}
      >
        <h1 className="text-xl font-bold text-center mb-6" style={{ color: '#9f1239' }}>
          Coach Emma — Admin
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#1a1a1a' }}
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #9f1239, #be123c)' }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
