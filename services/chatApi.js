export async function sendMessage(message, history = [], sessionId = null) {
  let response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, sessionId }),
    });
  } catch {
    throw new Error('Impossible de joindre le serveur. Vérifie ta connexion.');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? `Erreur serveur (${response.status})`);
  }

  const data = await response.json();
  return { reply: data.reply, coupons: data.coupons ?? [] };
}
