const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/inventory_dev' });

async function run() {
  const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'inventory'");
  console.log('Columns:', cols.rows.map(c => c.column_name));
  const res = await pool.query('SELECT * FROM inventory LIMIT 10');
  console.log('Rows count:', res.rows.length);
  if (res.rows.length > 0) {
    console.log('Sample row:', res.rows[0]);
  }
  await pool.end();
}
run();
