const bcrypt = require('bcryptjs');
const fs = require('fs');
const hash = bcrypt.hashSync(process.argv[2] || 'admin1234', 10);
fs.writeFileSync('hash.txt', hash);
console.log('Wrote hash to hash.txt');
