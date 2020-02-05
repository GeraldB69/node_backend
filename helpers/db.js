const mysql = require('mysql');

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password :  null,
  database : 'test_hpi'
});

// Nom de domaine à compléter
// const httpsPath = "/etc/letsencrypt/live/";

module.exports.connection = connection;
// module.exports.httpsPath = httpsPath;
