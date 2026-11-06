// run with: npm run backup
// makes a copy of the database in the backups folder next to it
const { makeBackup } = require('./services/backup');

console.log('Done:', makeBackup());
