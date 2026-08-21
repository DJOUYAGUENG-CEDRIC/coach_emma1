import { Mistral } from '@mistralai/mistralai';
import { buildSystemPrompt } from '@/config/systemPrompt';
import { sql, ensureTables, getActiveCoupons, getCouponsByIds } from '@/lib/db';

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 20;
const COUPON_TAG_RE = /\[\[COUPON:(\d+)\]\]/g;

export async function POST(request) {
  const { message, history = [], sessionId } = await request.json();

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return Response.json(
      { error: "Le champ 'message' est requis et ne peut pas être vide." },
      { status: 400 }
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { error: `Le message ne doit pas dépasser ${MAX_MESSAGE_LENGTH} caractères.` },
      { status: 400 }
    );
  }

  try {
    const trimmedHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_LENGTH) : [];

    let activeCoupons = [];
    if (process.env.DATABASE_URL) {
      try {
        activeCoupons = await getActiveCoupons();
      } catch (dbErr) {
        console.error('[chat] Coupons fetch error:', dbErr.message ?? dbErr);
      }
    }

    const messages = [
      { role: 'system', content: buildSystemPrompt(activeCoupons) },
      ...trimmedHistory,
      { role: 'user', content: message.trim() },
    ];

    const response = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages,
    });

    let reply = response.choices[0]?.message?.content ?? '';

    const activeIds = new Set(activeCoupons.map((c) => c.id));
    const referencedIds = [...new Set([...reply.matchAll(COUPON_TAG_RE)].map((m) => Number(m[1])))];
    const validIds = referencedIds.filter((id) => activeIds.has(id));

    reply = reply.replace(COUPON_TAG_RE, (full, id) => (activeIds.has(Number(id)) ? full : ''));

    let coupons = [];
    if (validIds.length) {
      try {
        const rows = await getCouponsByIds(validIds);
        coupons = rows.map((c) => ({
          id: c.id,
          label: c.label,
          description: c.description,
          image: c.image_data,
          expiresAt: c.expires_at,
        }));
      } catch (dbErr) {
        console.error('[chat] Coupons detail fetch error:', dbErr.message ?? dbErr);
      }
    }

    if (sessionId && process.env.DATABASE_URL) {
      try {
        await ensureTables();
        await sql`
          INSERT INTO sessions (id, updated_at, message_count)
          VALUES (${sessionId}, NOW(), 1)
          ON CONFLICT (id) DO UPDATE
          SET updated_at = NOW(), message_count = sessions.message_count + 1
        `;
        await sql`
          INSERT INTO messages (session_id, role, content)
          VALUES (${sessionId}, 'user', ${message.trim()}),
                 (${sessionId}, 'assistant', ${reply})
        `;
      } catch (dbErr) {
        console.error('[chat] DB error:', dbErr.message ?? dbErr);
      }
    }

    return Response.json({ reply, coupons });
  } catch (err) {
    console.error('[chat] Erreur lors de l\'appel Mistral :', err.message ?? err);
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer dans quelques instants.' },
      { status: 500 }
    );
  }
}
