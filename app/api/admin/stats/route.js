import { sql, ensureTables } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(request) {
  if (!checkAdminAuth(request)) return Response.json({ error: 'Non autorisé.' }, { status: 401 });

  try {
    await ensureTables();

    const [totalSessions] = await sql`SELECT COUNT(*) AS count FROM sessions`;
    const [totalMessages] = await sql`SELECT COUNT(*) AS count FROM messages`;
    const [todaySessions] = await sql`
      SELECT COUNT(*) AS count FROM sessions
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    const [todayMessages] = await sql`
      SELECT COUNT(*) AS count FROM messages
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;

    return Response.json({
      totalSessions: Number(totalSessions.count),
      totalMessages: Number(totalMessages.count),
      todaySessions: Number(todaySessions.count),
      todayMessages: Number(todayMessages.count),
    });
  } catch (err) {
    console.error('[admin/stats]', err);
    return Response.json({ error: err.message ?? 'Erreur base de données.' }, { status: 500 });
  }
}
