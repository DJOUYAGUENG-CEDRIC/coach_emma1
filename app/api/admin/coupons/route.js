import { getAllCoupons, createCoupon } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

const MAX_IMAGE_LENGTH = 2_000_000;

export async function GET(request) {
  if (!checkAdminAuth(request)) return Response.json({ error: 'Non autorisé.' }, { status: 401 });

  try {
    const coupons = await getAllCoupons();
    return Response.json({ coupons });
  } catch (err) {
    console.error('[admin/coupons] GET', err);
    return Response.json({ error: err.message ?? 'Erreur base de données.' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!checkAdminAuth(request)) return Response.json({ error: 'Non autorisé.' }, { status: 401 });

  const { label, description, image } = await request.json();

  if (!description || typeof description !== 'string' || !description.trim()) {
    return Response.json({ error: 'La description est requise.' }, { status: 400 });
  }
  if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
    return Response.json({ error: "L'image est requise." }, { status: 400 });
  }
  if (image.length > MAX_IMAGE_LENGTH) {
    return Response.json({ error: 'Image trop volumineuse.' }, { status: 400 });
  }

  try {
    const coupon = await createCoupon({
      label: typeof label === 'string' && label.trim() ? label.trim() : null,
      description: description.trim(),
      imageData: image,
    });
    return Response.json({ coupon }, { status: 201 });
  } catch (err) {
    console.error('[admin/coupons] POST', err);
    return Response.json({ error: err.message ?? 'Erreur base de données.' }, { status: 500 });
  }
}
