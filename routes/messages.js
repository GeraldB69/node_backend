const express = require('express');
const router = express.Router()
const cors = require('cors');
const connection = require('../helpers/db.js');
const bodyParser = require('body-parser');


router.use(cors());  
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true
}));

// GET //

// Affichage de tous les messages (superviseur) + AUTH à rajouter plus tard [superviseur]
// '/all'

// Affichage de tous les messages d'un Psychologue (cloturés/non cloturés) 
// '?pid='

// Affichage des messages d'un Collaborateur en particulier
// '?cid='
router.get('/', (req, res) => {
  const collabId = req.query.cid;
  console.log("messages-cid", collabId)
  const sql =   
    'SELECT * FROM test_hpi.messages AS M ' + 
    'INNER JOIN (SELECT * ' + 
    'FROM test_hpi.tickets) AS T ' + 
    'INNER JOIN (SELECT * ' + 
    'FROM test_hpi.users) AS U ' + 
    'ON M.collab_id = T.collab_id ' + 
    'WHERE M.collab_id = ? ';
    // 'AND M.collab_id = ?';
  connection.query(sql, [collabId], (error, response) => {
    console.log(response)
    if (error) 
      res.sendStatus(500);
    else 
      (response.length > 0) 
      ? res.status(200).json(response) 
      : res.status(404).send("Not Found");
  });
})

// Affichage des messages d'un Channel en particulier
// '?chid='
router.get('/', (req, res) => {
  const channelId = req.query.chid;
  console.log("messages-chid", channelId)
  const sql =   
    'SELECT * FROM test_hpi.messages AS M ' + 
    'INNER JOIN (SELECT * ' + 
    'FROM test_hpi.tickets) AS T ' + 
    'ON T.id = M.tickets_id ' + 
    'WHERE T.channel = ? ' + 
    'ORDER BY M.timestamp ASC ';
  connection.query(sql, [channelId], (error, response) => {
    console.log(response)
    if (error) 
      res.sendStatus(500);
    else 
      (response.length > 0) 
      ? res.status(200).json(response) 
      : res.status(404).send("Not Found");
  });
})


// Mix des 2 ?


// POST //

// Un utilisateur envoie un message sur un channel


module.exports = router;
