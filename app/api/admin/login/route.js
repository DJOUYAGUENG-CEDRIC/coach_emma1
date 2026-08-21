export async function POST(request) {
  const { password } = await request.json();
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const token = Buffer.from(expected).toString('base64');

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
    },
  });
}
