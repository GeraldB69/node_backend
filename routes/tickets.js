const express = require('express');
const router = express.Router()

const connection = require('../helpers/db.js');


// GET //

// Clic sur le lien envoyé par mail "?token=" [collab]
router.get('/', (req, res) => {
  const token = req.query.token;
  const sql = 'SELECT id FROM users WHERE token = ?';
  connection.query(sql, [token], (error, response) => {
    if (error) 
      res.sendStatus(500);
    else 
      (response.length > 0) 
        ? res.status(200).json({...response[0], token}) 
        : res.status(404).send("Not Found");
  });
})

// Affichage de TOUS les tickets [psy]
router.get('/all', (req, res) => {
  const sql = 'SELECT * FROM tickets';
  connection.query(sql, (error, response) => {
    if (error) 
      res.status(500).json(error);
    else 
      res.status(200).json(response);
  });
});

// Affichage des tickets non colturés (!= closed) [psy]
router.get('/pending', (req, res) => {
  const sql = 'SELECT * FROM tickets WHERE state != "closed"';
  connection.query(sql, (error, response) => {
    if 
      (error) res.status(500).json(error);
    else 
      res.status(200).json(response);
  });
});


// POST //

// Ouverture / poursuite d'un ticket (clic sur démarrer une conversation) [collab]
router.post('/', (req, res) => {

  // Infos envoyées par le client ({ id (collab), pseudo, token })
  const body = { ...req.body }; 

  // Recherche du collaborateur (id) dans la table 'tickets' dont le ticket serait "en cours"
  const waitingTickets = 
    'SELECT * FROM test_hpi.users AS U ' + 
    'INNER JOIN (SELECT id, state, channel, collab_id ' + 
    'FROM test_hpi.tickets) AS T ' + 
    'ON U.id = T.collab_id ' + 
    'WHERE U.token = ? ' + 
    'AND ( ' + 
      'T.state = "pending" OR ' + 
      'T.state = "open" OR ' + 
      'T.state = "closed")';
  connection.query(waitingTickets, [body.token], (error, response) => {
    if (error) res.sendStatus(500);
    else if (response.length > 0 && response[0].status === "closed") {
      // Le collaborateur a déjà fait appel au psychologue mais son ticket a été fermé : il faut un nouveau ticket
      const bodyNewTicket = { 
        channel: newChannel(response[0].id), 
        collab_id: response[0].id, 
        pseudo: body.pseudo,
        state: "open"
      }
      const newTicket = 'INSERT INTO tickets SET ?';
      connection.query(newTicket, [bodyNewTicket], (error, response) => {
        if (error) 
          res.status(500).json(error)
        else {
          // Un nouveau ticket est crée
          res.sendStatus(201);
        }
      })
    } else if (
      response.length > 0 && 
      body.id === response[0].collab_id && 
      (response[0].state === "pending" || response[0].state === "open")) {
      // Le token est en attente et l'id correspond => update
      const collab = { ...response[0], pseudo: body.pseudo } // toutes les infos ici
      const update = 'UPDATE tickets SET ? WHERE id = ?';
      connection.query(update, [{ pseudo: collab.pseudo }, collab.id], (error, response) => {
        if (error) 
          res.sendStatus(500);
        else {
          res.status(201).send({ id: body.id, channel: collab.channel, pseudo: body.pseudo })
        }
      })
    } else if (response.length > 0 && body.id !== response[0].collab_id) {
      // Le token existe mais id différents
      res.sendStatus(404);
    } else {
      // Le ticket n'existe pas du tout ou pas de ticket en cours
      console.log(`No Pending Ticket (id: ${body.id})`)  // 789/xxx = OK
      // Le token est-il dans la BDD ?
      const test = 'SELECT id FROM users WHERE token = ? ';
      connection.query(test, [body.token], (error, response) => {
        if (error) 
          res.sendStatus(500);
        else if (response.length > 0 && response[0].id === body.id) {
          // Le token est dans la BDD : on prépare le nouveau ticket + nouveau channel
          const bodyNewTicket = { 
            channel: newChannel(response[0].id), 
            collab_id: response[0].id, 
            pseudo: body.pseudo,
            state: "open"
          }
          const newTicket =  'INSERT INTO tickets SET ?';
          connection.query(newTicket, [bodyNewTicket], (error, response) => {
            if (error) 
              res.status(500).json(error)
            else {
              // Token et id vérifiés : un nouveau ticket est crée
              res.sendStatus(201);
            }
          })
        }
        else 
          // Le token n'existe pas et/ou l'id ne correspond pas
          res.status(404).send({ bad_token: body.token});
      })
    }
  })
});

// Fonctions annexes // 

newChannel = (id) => {
  const date = new Date();
  const twoChars = (value) => (value < 10) ? `0${value}` : value;
  return (`${date.getFullYear()}${twoChars(date.getMonth())}${twoChars(date.getDate())}${twoChars(date.getHours())}${twoChars(date.getMinutes())}_${id}`)
}

module.exports = router;
