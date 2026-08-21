import { sql, ensureTables } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(request) {
  if (!checkAdminAuth(request)) return Response.json({ error: 'Non autorisé.' }, { status: 401 });

  try {
    await ensureTables();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);
    const offset = Number(searchParams.get('offset') ?? 0);

    const rows = await sql`
      SELECT
        s.id, s.created_at, s.updated_at, s.message_count,
        (SELECT content FROM messages WHERE session_id = s.id AND role = 'user' ORDER BY created_at ASC LIMIT 1) AS first_message
      FROM sessions s
      ORDER BY s.updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`SELECT COUNT(*) AS count FROM sessions`;

    return Response.json({ conversations: rows, total: Number(count) });
  } catch (err) {
    console.error('[admin/conversations]', err);
    return Response.json({ error: err.message ?? 'Erreur base de données.' }, { status: 500 });
  }
}
