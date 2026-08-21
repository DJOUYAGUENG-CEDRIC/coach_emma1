export function checkAdminAuth(request) {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/admin_token=([^;]+)/);
  const token = match?.[1];
  const expected = Buffer.from(process.env.ADMIN_PASSWORD ?? '').toString('base64');
  return token === expected;
}
