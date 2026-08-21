import { sql, ensureTables } from '@/lib/db';

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    await ensureTables();

    const deletedCoupons = await sql`
      DELETE FROM coupons WHERE created_at < NOW() - INTERVAL '7 days' RETURNING id
    `;
    const deletedSessions = await sql`
      DELETE FROM sessions WHERE updated_at < NOW() - INTERVAL '7 days' RETURNING id
    `;

    return Response.json({
      deletedCoupons: deletedCoupons.length,
      deletedSessions: deletedSessions.length,
    });
  } catch (err) {
    console.error('[cron/cleanup]', err);
    return Response.json({ error: err.message ?? 'Erreur base de données.' }, { status: 500 });
  }
}
