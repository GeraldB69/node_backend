const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'mot_de_passe',   // A modifier
  database : 'nom_de_la_table' // A modifier
});
module.exports =  connection;
