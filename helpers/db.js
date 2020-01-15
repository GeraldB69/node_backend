const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password :  null,
  database : 'test_hpi'
});
module.exports =  connection;
