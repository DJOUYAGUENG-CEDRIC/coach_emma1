import { sql } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  if (!checkAdminAuth(request)) return Response.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await params;
  const messages = await sql`
    SELECT role, content, created_at FROM messages
    WHERE session_id = ${id} ORDER BY created_at ASC
  `;
  return Response.json({ messages });
}
