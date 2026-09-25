const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/inventory_dev',
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running totp migration on inventory_dev...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS totp_data (
        totp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_name VARCHAR(128),
        encrypted_data TEXT,
        linked BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(user_id),
        created_on TIMESTAMP DEFAULT now(),
        updated_on TIMESTAMP DEFAULT now(),
        active BOOLEAN DEFAULT true
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS shared_totp (
        shared_data_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        totp_id UUID REFERENCES totp_data(totp_id),
        shared_with UUID REFERENCES users(user_id)
      );
    `);

    await client.query(`
      ALTER TABLE employee_vault ADD COLUMN IF NOT EXISTS linked_totp UUID REFERENCES totp_data(totp_id);
      ALTER TABLE team_vault ADD COLUMN IF NOT EXISTS linked_totp UUID REFERENCES totp_data(totp_id);
    `);

    console.log('TOTP tables created successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
