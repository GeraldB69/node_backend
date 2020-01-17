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
router.get('/', (req, res, next) => {
  const collabId = req.query.cid;
  if (collabId) {
    console.log("messages-cid: ", collabId)
    const sql = 
      'SELECT * FROM test_hpi.messages AS M ' +
      'INNER JOIN (SELECT * ' +
      'FROM test_hpi.tickets) AS T ' +
      'ON T.id = M.tickets_id  ' +
      'WHERE T.collab_id = ?';
    connection.query(sql, [collabId], (error, response) => {
      if (error) 
        res.sendStatus(500);
      else 
        (response.length > 0) 
        ? res.status(200).json(response) 
        : res.status(404).send("Not Found");
    });
  } else next();
})

// Affichage des messages d'un Channel en particulier
// '?chid='
router.get('/', (req, res, next) => {
  const channelId = req.query.chid;
  if (channelId) {
    console.log("messages-chid: ", req)
    const sql =   
      'SELECT * FROM test_hpi.messages AS M ' + 
      'INNER JOIN (SELECT * ' + 
      'FROM test_hpi.tickets) AS T ' + 
      'ON T.id = M.tickets_id ' + 
      'WHERE T.channel = ? ' + 
      'ORDER BY M.timestamp ASC ';
    connection.query(sql, [channelId], (error, response) => {
      if (error) 
        res.sendStatus(500);
      else 
        (response.length > 0) 
        ? res.status(200).json(response) 
        : res.status(404).send("Not Found");
    });
  } else next();
})


// Mix des 2 ?


// POST //

// Un utilisateur envoie un message sur un channel


module.exports = router;
