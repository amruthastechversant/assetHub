const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/inventory_dev'
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Starting DB seeding...');

    // 1. Asset Types
    const assetTypes = [
      { name: 'Laptop' },
      { name: 'Monitor' },
      { name: 'Desktop' },
      { name: 'Keyboard' },
      { name: 'Mouse' },
      { name: 'Tablet' },
      { name: 'Network Device' }
    ];

    const typeMap = new Map();
    for (const t of assetTypes) {
      const existing = await client.query(
        'SELECT asset_type_id FROM asset_type_table WHERE LOWER(asset_type) = LOWER($1)',
        [t.name]
      );
      if (existing.rows.length > 0) {
        typeMap.set(t.name, existing.rows[0].asset_type_id);
      } else {
        const inserted = await client.query(
          'INSERT INTO asset_type_table (asset_type) VALUES ($1) RETURNING asset_type_id',
          [t.name]
        );
        typeMap.set(t.name, inserted.rows[0].asset_type_id);
      }
    }
    console.log('Seeded asset types:', Array.from(typeMap.entries()));

    // 2. Fetch Location Map
    const locationsRes = await client.query('SELECT location_id, location_name FROM locations');
    const locationMap = new Map();
    for (const row of locationsRes.rows) {
      locationMap.set(row.location_name.toLowerCase(), row.location_id);
    }
    console.log('Available locations:', Array.from(locationMap.entries()));

    // 3. Fetch User Map
    const usersRes = await client.query('SELECT user_id, email_id FROM users');
    const userMap = new Map();
    for (const row of usersRes.rows) {
      userMap.set(row.email_id.toLowerCase(), row.user_id);
    }
    console.log('Available users:', Array.from(userMap.keys()));

    // 4. Sample Devices
    const devices = [
      {
        asset_code: 'TV-MT-0001',
        model: 'Dell UltraSharp 27 4K Monitor',
        asset_type: typeMap.get('Monitor'),
        storage: 'N/A',
        os: 'N/A',
        ram: 'N/A',
        processor: 'N/A',
        purchase_date: '2023-08-15',
        status: 'active',
        purchase_amount: 45000,
        location: locationMap.get('cochin'),
        assigned_email: 'ashiq.s@techversantinfotech.com'
      },
      {
        asset_code: 'DEV-10025',
        model: 'MacBook Pro M3 Max 16-inch',
        asset_type: typeMap.get('Laptop'),
        storage: '1TB SSD',
        os: 'macOS Sequoia',
        ram: '36GB Unified',
        processor: 'Apple M3 Max (16-core)',
        purchase_date: '2025-01-15',
        status: 'active',
        purchase_amount: 249999,
        location: locationMap.get('cochin'),
        assigned_email: 'ashiq.s@techversantinfotech.com'
      },
      {
        asset_code: 'TV-LAP-02481',
        model: 'ThinkPad X1 Carbon Gen 11',
        asset_type: typeMap.get('Laptop'),
        storage: '512GB SSD',
        os: 'Ubuntu 24.04 LTS',
        ram: '16GB',
        processor: 'Intel Core i7-1365U',
        purchase_date: '2024-02-10',
        status: 'active',
        purchase_amount: 145000,
        location: locationMap.get('trivandrum'),
        assigned_email: 'ameen@techversantinfotech.com'
      },
      {
        asset_code: 'TV-MON-09124',
        model: 'LG 34" UltraWide Curved Monitor',
        asset_type: typeMap.get('Monitor'),
        storage: 'N/A',
        os: 'N/A',
        ram: 'N/A',
        processor: 'N/A',
        purchase_date: '2023-11-20',
        status: 'active',
        purchase_amount: 62000,
        location: locationMap.get('cochin'),
        assigned_email: 'joby@techversantinfo.com'
      },
      {
        asset_code: 'DEV-20411',
        model: 'Keychron Q1 Pro Wireless Mechanical Keyboard',
        asset_type: typeMap.get('Keyboard'),
        storage: 'N/A',
        os: 'N/A',
        ram: 'N/A',
        processor: 'N/A',
        purchase_date: '2024-05-12',
        status: 'available',
        purchase_amount: 18500,
        location: locationMap.get('remote'),
        assigned_email: null
      },
      {
        asset_code: 'DEV-30512',
        model: 'iPad Pro 12.9 M2',
        asset_type: typeMap.get('Tablet'),
        storage: '256GB',
        os: 'iPadOS 17',
        ram: '8GB',
        processor: 'Apple M2',
        purchase_date: '2024-06-01',
        status: 'available',
        purchase_amount: 112000,
        location: locationMap.get('cochin'),
        assigned_email: null
      },
      {
        asset_code: 'DEV-40890',
        model: 'Dell Precision 7780 Workstation',
        asset_type: typeMap.get('Laptop'),
        storage: '2TB SSD',
        os: 'Windows 11 Pro',
        ram: '64GB',
        processor: 'Intel Core i9-13950HX',
        purchase_date: '2024-01-20',
        status: 'active',
        purchase_amount: 310000,
        location: locationMap.get('trivandrum'),
        assigned_email: 'admin@techversantinfo.com'
      }
    ];

    for (const d of devices) {
      let assetId;
      const existing = await client.query(
        'SELECT asset_id FROM inventory WHERE LOWER(asset_code) = LOWER($1)',
        [d.asset_code]
      );

      if (existing.rows.length > 0) {
        assetId = existing.rows[0].asset_id;
        await client.query(
          `UPDATE inventory 
           SET model = $1, asset_type = $2, storage = $3, os = $4, ram = $5, 
               processor = $6, purchase_date = $7, status = $8, purchase_amount = $9, 
               location = $10 
           WHERE asset_id = $11`,
          [
            d.model,
            d.asset_type,
            d.storage,
            d.os,
            d.ram,
            d.processor,
            d.purchase_date,
            d.status,
            d.purchase_amount,
            d.location,
            assetId
          ]
        );
        console.log(`Updated inventory item: ${d.asset_code} (${assetId})`);
      } else {
        const insertRes = await client.query(
          `INSERT INTO inventory 
           (asset_code, model, asset_type, storage, os, ram, processor, purchase_date, status, purchase_amount, location)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING asset_id`,
          [
            d.asset_code,
            d.model,
            d.asset_type,
            d.storage,
            d.os,
            d.ram,
            d.processor,
            d.purchase_date,
            d.status,
            d.purchase_amount,
            d.location
          ]
        );
        assetId = insertRes.rows[0].asset_id;
        console.log(`Inserted inventory item: ${d.asset_code} (${assetId})`);
      }

      // Handle user assignment if present
      if (d.assigned_email && userMap.has(d.assigned_email.toLowerCase())) {
        const userId = userMap.get(d.assigned_email.toLowerCase());
        const existingAssignment = await client.query(
          'SELECT assigned_id FROM assigned_assets WHERE asset_id = $1 AND user_id = $2 AND active = true',
          [assetId, userId]
        );
        if (existingAssignment.rows.length === 0) {
          // Deactivate any old active assignments for this asset
          await client.query(
            'UPDATE assigned_assets SET active = false WHERE asset_id = $1',
            [assetId]
          );
          await client.query(
            'INSERT INTO assigned_assets (asset_id, user_id, active) VALUES ($1, $2, true)',
            [assetId, userId]
          );
          console.log(`Assigned ${d.asset_code} to user ${d.assigned_email}`);
        }
      }
    }

    await client.query('COMMIT');
    console.log('DB seeding completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DB seeding failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
