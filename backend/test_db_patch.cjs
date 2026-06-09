require('dotenv').config();
const pool = require('./src/db/pool');

async function runTest() {
  console.log('Running integration test for professional profile services...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create a test user
    const userEmail = `test_${Date.now()}@example.com`;
    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, user_type)
       VALUES ($1, 'hashed_password', 'PROFESSIONAL')
       RETURNING id`,
      [userEmail]
    );
    const userId = userRes.rows[0].id;
    console.log('Created test user with ID:', userId);

    // 2. Create a professional profile
    const profRes = await client.query(
      `INSERT INTO professional_profiles (user_id, company_name, first_name, last_name, work_address)
       VALUES ($1, 'Test Company', 'John', 'Doe', '123 Main St')
       RETURNING *`,
      [userId]
    );
    console.log('Created professional profile:', profRes.rows[0]);

    // 3. Update profile services (simulate handleAddVariant/handleSave from modal)
    const companyName = undefined;
    const firstName = undefined;
    const lastName = undefined;
    const bio = undefined;
    const workAddress = undefined;
    const workPhone = undefined;
    const workingHours = undefined;
    const breakTimes = undefined;
    const services = [
      {
        id: 'service_massage',
        name: 'Massage Therapy',
        variants: [
          {
            id: 'variant_deep',
            name: 'Deep Tissue',
            price: 95.0,
            duration: 60,
            description: 'Intense massage',
            photos: []
          }
        ]
      }
    ];

    const query = `UPDATE professional_profiles 
       SET company_name = COALESCE($1, company_name),
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           bio = COALESCE($4, bio),
           work_address = COALESCE($5, work_address),
           work_phone = COALESCE($6, work_phone),
           working_hours = COALESCE($7::jsonb, working_hours),
           break_times = COALESCE($8::jsonb, break_times),
           services = COALESCE($9::jsonb, services),
           updated_at = NOW()
       WHERE user_id = $10
       RETURNING *`;

    const values = [
      companyName, 
      firstName, 
      lastName, 
      bio, 
      workAddress, 
      workPhone, 
      workingHours ? JSON.stringify(workingHours) : null, 
      breakTimes ? JSON.stringify(breakTimes) : null, 
      services ? JSON.stringify(services) : null, 
      userId
    ];

    const updateRes = await client.query(query, values);
    console.log('Updated profile rows:', updateRes.rows.length);
    if (updateRes.rows.length > 0) {
      console.log('Stored services JSON:', JSON.stringify(updateRes.rows[0].services, null, 2));
    }

    await client.query('ROLLBACK'); // Roll back so we don't clutter the DB
    console.log('Test completed successfully and rolled back.');
  } catch (err) {
    console.error('Integration test failed:', err);
    try {
      await client.query('ROLLBACK');
    } catch (e) {}
  } finally {
    client.release();
    await pool.end();
  }
}

runTest();
