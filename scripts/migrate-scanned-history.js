const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/inventory_dev',
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migration: create user_scanned_device_history...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_scanned_device_history (
        user_scanned_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        scanned_devices JSONB NOT NULL DEFAULT '[]'::jsonb,
        scanned_by UUID REFERENCES users(user_id) ON DELETE CASCADE,
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_user_scanned_history_scanned_by ON user_scanned_device_history(scanned_by);
    `);
    console.log('Table user_scanned_device_history created successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
