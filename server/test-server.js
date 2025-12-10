// Test server routes
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

const testServer = async () => {
  try {
    // 1. Test health
    console.log('1. Testing /api/health...');
    const health = await axios.get(`${baseURL}/health`);
    console.log('✅ Health:', health.data);

    // 2. Test login
    console.log('\n2. Testing login...');
    const login = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin',
      password: 'admin'
    });
    console.log('✅ Login success');
    const token = login.data.token;

    // 3. Test projects
    console.log('\n3. Testing /api/projects...');
    try {
      const projects = await axios.get(`${baseURL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Projects:', projects.data.length, 'items');
    } catch (err) {
      console.error('❌ Projects error:', err.response?.data || err.message);
    }

    // 4. Test stats
    console.log('\n4. Testing /api/stats/materials-by-category...');
    try {
      const stats = await axios.get(`${baseURL}/stats/materials-by-category`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Stats:', stats.data.length, 'items');
    } catch (err) {
      console.error('❌ Stats error:', err.response?.status, err.response?.data || err.message);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Server không chạy! Hãy chạy: npm run dev');
    }
  }
};

testServer();

