const axios = require('axios');

async function testApiFlow() {
  const baseURL = 'http://localhost:5001/api';
  console.log('Testing API flow on', baseURL);

  try {
    // 1. Register a professional
    const email = `test_pro_${Date.now()}@example.com`;
    const password = 'Password123';
    console.log('Registering user:', email);
    const regRes = await axios.post(`${baseURL}/auth/register`, {
      email,
      password,
      userType: 'PROFESSIONAL',
      firstName: 'Jane',
      lastName: 'Doe',
      companyName: 'Spa Retreat',
      workAddress: '456 Wellness Way'
    });

    const token = regRes.data.token;
    console.log('Registered successfully. Token acquired.');

    // Configure axios with token
    const api = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // 2. Fetch initial profile
    const profileResBefore = await api.get('/professionals/profile');
    console.log('Initial profile services:', profileResBefore.data.services);

    // 3. Update profile services (simulate adding service & variant)
    const services = [
      {
        id: 'service-hair-cut',
        name: 'Hair Services',
        variants: [
          {
            id: 'variant-trim',
            name: 'Standard Trim',
            price: 45.0,
            duration: 30,
            description: 'Dry trim',
            photos: []
          }
        ]
      }
    ];

    console.log('Updating profile with services...');
    const patchRes = await api.patch('/professionals/profile', { services });
    console.log('Patch response status:', patchRes.status);
    console.log('Returned services from patch:', patchRes.data.services);

    // 4. Fetch profile again to verify persistence
    const profileResAfter = await api.get('/professionals/profile');
    console.log('Fetched profile services after update:', profileResAfter.data.services);

    if (JSON.stringify(profileResAfter.data.services) === JSON.stringify(services)) {
      console.log('✅ API Flow works perfectly! Services and variants persist successfully.');
    } else {
      console.error('❌ API Flow failed! Services and variants did not persist.');
    }

  } catch (err) {
    console.error('API flow test failed with error:', err.response?.data || err.message);
  }
}

testApiFlow();
