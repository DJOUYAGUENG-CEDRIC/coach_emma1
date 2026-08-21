import { deleteCoupon } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function DELETE(request, { params }) {
  if (!checkAdminAuth(request)) return Response.json({ error: 'Non autorisé.' }, { status: 401 });

  const { id } = await params;

  try {
    await deleteCoupon(Number(id));
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[admin/coupons/:id] DELETE', err);
    return Response.json({ error: err.message ?? 'Erreur base de données.' }, { status: 500 });
  }
}
