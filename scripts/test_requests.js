const axios = require('axios');

async function test() {
  try {
    console.log('Posting register...');
    const reg = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Node Tester',
      email: 'node.tester@example.local',
      password: 'test1234'
    });
    console.log('REGISTER RESPONSE:');
    console.log(JSON.stringify(reg.data, null, 2));
  } catch (e) {
    console.error('REGISTER ERROR:', e.message);
    if (e.response) console.error('STATUS', e.response.status, JSON.stringify(e.response.data));
  }

  try {
    console.log('\nRequesting dev admin token...');
    const token = await axios.get('http://localhost:5000/dev/admin-token');
    console.log('DEV TOKEN RESPONSE:');
    console.log(JSON.stringify(token.data, null, 2));
  } catch (e) {
    console.error('DEV TOKEN ERROR:', e.message);
    if (e.response) console.error('STATUS', e.response.status, JSON.stringify(e.response.data));
  }

  try {
    console.log('\nFetching admin users using dev token from file...');
    const fs = require('fs');
    const tk = fs.readFileSync('c:/Users/ruran/Eliiiiii/Youth-learning-Platform/Backend/dev_admin_token.txt', 'utf8').trim();
    const users = await axios.get('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${tk}` } });
    console.log('ADMIN USERS RESPONSE:');
    console.log(JSON.stringify(users.data, null, 2));
  } catch (e) {
    console.error('ADMIN USERS ERROR:', e.message);
    if (e.response) console.error('STATUS', e.response.status, JSON.stringify(e.response.data));
  }
}

test();
