const express = require('express');
const router = express.Router()
const cors = require('cors');
const helpers = require('../helpers/db.js');
const bodyParser = require('body-parser');


router.use(cors());  
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true
}));

// GET //

// Affichage des messages d'un Collaborateur en particulier
// '?cid='
router.get('/', (req, res, next) => {
  const collabId = req.query.cid;
  if (collabId) {
    // console.log("messages-cid: ", collabId)
    const sql = 
      'SELECT * FROM test_hpi.messages AS M ' +
      'INNER JOIN (SELECT * ' +
      'FROM test_hpi.tickets) AS T ' +
      'ON T.id = M.tickets_id  ' +
      'WHERE T.collab_id = ?';
    helpers.connection.query(sql, [collabId], (error, response) => {
      if (error) 
        res.sendStatus(500);
      else {
        (response.length > 0) 
        ? res.status(200).json(response) 
        : res.status(204).send("No Content");
      }
    });
  } else next();
})

// Affichage des messages d'un Channel en particulier
// '?chid='
router.get('/', (req, res, next) => {
  const channelId = req.query.chid;
  if (channelId) {
    // console.log("messages-chid: ", req)
    const sql =   
      'SELECT * FROM test_hpi.messages AS M ' + 
      'INNER JOIN (SELECT * ' + 
      'FROM test_hpi.tickets) AS T ' + 
      'INNER JOIN (SELECT id, CONCAT(firstname, " ", lastname) AS user, role ' + 
      'FROM test_hpi.users) AS U ' + 
      'ON (T.id = M.tickets_id ' + 
      'AND M.sender_id = U.id) ' + 
      'WHERE T.channel = ? ' + 
      'ORDER BY M.timestamp ASC ';
    helpers.connection.query(sql, [channelId], (error, response) => {
      if (error) 
        res.sendStatus(500);
      else 
        (response.length > 0) 
        ? res.status(200).json(response) 
        : res.status(204).send("No Content");
    });
  } else next();
})

module.exports = router;
