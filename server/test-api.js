// Script test API nhanh
const axios = require('axios');

const testAPI = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Test login
    console.log('1. Testing login...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin',
      password: 'admin'
    });
    console.log('✅ Login success:', loginRes.data.success);
    const token = loginRes.data.token;
    
    // Test projects
    console.log('\n2. Testing /projects...');
    const projectsRes = await axios.get(`${baseURL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Projects:', projectsRes.data.length, 'items');
    
    // Test stats
    console.log('\n3. Testing /stats/receipts-by-month...');
    const statsRes = await axios.get(`${baseURL}/stats/receipts-by-month`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Stats:', statsRes.data.length, 'items');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testAPI();

