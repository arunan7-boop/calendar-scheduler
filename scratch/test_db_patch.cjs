require('dotenv').config({ path: 'backend/.env' });
const pool = require('../backend/src/db/pool');

async function runTest() {
  console.log('Testing pg query binding for undefined parameters...');
  try {
    // Mock req.body where only services is defined, others are undefined
    const companyName = undefined;
    const firstName = undefined;
    const lastName = undefined;
    const bio = undefined;
    const workAddress = undefined;
    const workPhone = undefined;
    const workingHours = undefined;
    const breakTimes = undefined;
    const services = [{ id: 'mock-1', name: 'Mock Service', variants: [] }];
    const userId = 'mock-user-id'; // placeholder

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

    console.log('Values to bind:', values);

    // Run query (will fail on connection if DATABASE_URL is not set, or fail on bind if undefined is passed)
    const result = await pool.query(query, values);
    console.log('Query finished successfully. Rows returned:', result.rows.length);
  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    await pool.end();
  }
}

runTest();
