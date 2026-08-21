import { neon } from '@neondatabase/serverless';

let _sql = null;
function getConn() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}
export function sql(strings, ...values) { return getConn()(strings, ...values); }

let ready = false;

export async function ensureTables() {
  if (ready) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        message_count INTEGER DEFAULT 0
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at DESC)`;
    await sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        label TEXT,
        description TEXT NOT NULL,
        image_data TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_coupons_expires ON coupons(expires_at DESC)`;
  } catch (err) {
    const msg = err.message ?? '';
    if (!msg.includes('already exists') && !msg.includes('duplicate key')) throw err;
  }
  ready = true;
}

export async function getActiveCoupons() {
  await ensureTables();
  return sql`
    SELECT id, label, description, created_at, expires_at
    FROM coupons
    WHERE expires_at > NOW()
    ORDER BY created_at DESC
  `;
}

export async function getCouponsByIds(ids) {
  if (!ids.length) return [];
  await ensureTables();
  return sql`
    SELECT id, label, description, image_data, expires_at
    FROM coupons
    WHERE id = ANY(${ids}::int[]) AND expires_at > NOW()
  `;
}

export async function getAllCoupons() {
  await ensureTables();
  return sql`
    SELECT id, label, description, image_data, created_at, expires_at,
           (expires_at > NOW()) AS is_active
    FROM coupons
    ORDER BY created_at DESC
    LIMIT 50
  `;
}

export async function createCoupon({ label, description, imageData }) {
  await ensureTables();
  const [row] = await sql`
    INSERT INTO coupons (label, description, image_data, expires_at)
    VALUES (${label ?? null}, ${description}, ${imageData}, NOW() + INTERVAL '24 hours')
    RETURNING id, label, description, created_at, expires_at
  `;
  return row;
}

export async function deleteCoupon(id) {
  await ensureTables();
  await sql`DELETE FROM coupons WHERE id = ${id}`;
}
