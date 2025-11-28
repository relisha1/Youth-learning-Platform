const axios = require('axios');

(async ()=>{
  try {
    const res = await axios.get('http://localhost:5000/api/admin/users', { timeout: 5000 });
    console.log('STATUS', res.status);
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error('ERROR', e.message);
    if (e.response) console.error('STATUS', e.response.status, JSON.stringify(e.response.data));
  }
})();
