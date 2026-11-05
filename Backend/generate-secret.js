// run with: npm run secret
// prints a new random JWT secret, copy it into your .env file
const crypto = require('crypto');

console.log(crypto.randomBytes(48).toString('hex'));
