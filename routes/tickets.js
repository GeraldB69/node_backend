const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const router = express.Router()
const cors = require('cors');
const connection = require('../helpers/db.js');
const bodyParser = require('body-parser');
const verifyToken = require('../helpers/verifyToken')


router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true
}));


// GET //

// Clic sur le lien envoyé par mail "?token=" [collab] UTILE ?
router.get('/', (req, res) => {
  const token = req.query.token;
  const sql = 'SELECT id FROM users WHERE token = ?';
  connection.query(sql, [token], (error, response) => {
    if (error)
      res.sendStatus(500);
    else
      (response.length > 0)
        ? res.status(200).json({ ...response[0], token })
        : res.status(404).send("Not Found");
  });
})

// Affichage de TOUS les tickets [psy]
router.get('/all', verifyToken, (req, res) => {
  const sql = 'SELECT * FROM tickets';
  connection.query(sql, (error, response) => {
    if (error)
      res.status(500).json(error);
    else
      (response.length > 0)
        ? res.status(200).json(response)
        : res.status(404).send("Not Found");
  });
});

// Affichage de TOUS les tickets d'un collaborateur [psy]
router.get('/:cid', (req, res) => {
  const collab_id = req.params.cid;
  const sql = 'SELECT * FROM tickets WHERE collab_id = ?';
  connection.query(sql, [collab_id], (error, response) => {
    if (error)
      res.status(500).json(error);
    else
      (response.length > 0)
        ? res.status(200).json(response)
        : res.status(404).send("Not Found");
  });
});

// Affichage du ticket en cours d'un collaborateur [collab/psy]
router.get('/:cid/pending', (req, res) => {
  const collab_cid = req.params.cid;
  const sql =
    'SELECT * ' +
    'FROM tickets ' +
    'WHERE collab_id = ? ' +
    'AND ( ' +
    'state = "pending" OR ' +
    'state = "open")';
  connection.query(sql, [collab_id], (error, response) => {
    if (error)
      res.status(500).json(error);
    else
      (response.length > 0)
        ? res.status(200).json(response)
        : res.status(404).send("Not Found");
  });
});

// Affichage des tickets cloturés d'un collaborateur [psy]
router.get('/:cid/closed', (req, res) => {
  const collab_id = req.params.cid;
  const sql =
    'SELECT * ' +
    'FROM tickets ' +
    'WHERE collab_id = ? ' +
    'AND state = "closed"';
  connection.query(sql, [collab_id], (error, response) => {
    if (error)
      res.status(500).json(error);
    else
      (response.length > 0)
        ? res.status(200).json(response)
        : res.status(404).send("Not Found");
  });
});

// Affichage des tickets non colturés (!= closed) [psy]
router.get('/pending', (req, res) => {
  const sql = 'SELECT * FROM tickets WHERE state != "closed"';
  connection.query(sql, (error, response) => {
    if
      (error) res.status(500).json(error);
    else
      (response.length > 0)
        ? res.status(200).json(response)
        : res.status(404).send("Not Found");
  });
});


// POST //

// Ouverture / poursuite d'un ticket (clic sur démarrer une conversation) [collab]
router.post('/', (req, res) => {

  // Infos envoyées par le client ({ id (collab), pseudo, token, message })
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
    'T.state = "closed") ' +
    'ORDER BY T.state DESC';
  connection.query(waitingTickets, [body.token], (error, response) => {
    if (error) res.sendStatus(500);

    else if (
      response.length > 0 &&
      body.id.toString() === response[0].collab_id.toString() &&
      (response[0].state === "pending" || response[0].state === "open")) {

      // Le token est "en cours" et l'id correspond => update
      const collab = { ...response[0], pseudo: body.pseudo } // toutes les infos ici
      const update = 'UPDATE tickets SET ? WHERE id = ?';
      connection.query(update, [{ pseudo: collab.pseudo }, collab.id], (error, response) => {
        if (error) res.sendStatus(500);
        else {
          console.log("ticket.js / update token:")
          newOnChannel(collab.channel, body.id);
          res.status(201).send({ 
            id: body.id, 
            channel: collab.channel, 
            pseudo: body.pseudo,
            tickets_id: collab.id 
          })
        }
      })
    } 

    else if (response.length > 0 && response[0].status === "closed") {

      // Le collaborateur a déjà fait appel au psychologue mais son ticket a été cloturé => nouveau ticket
      console.log("closed", response[0])
      const bodyNewTicket = {
        channel: newChannel(response[0].id),
        collab_id: response[0].id,
        pseudo: body.pseudo,
        state: "open"
      }
      const newTicket = 'INSERT INTO tickets SET ?';
      connection.query(newTicket, [bodyNewTicket], (error, response) => {

        if (error) res.status(500).json(error)
        else {
          console.log("ticket.js / ticket cloturé => new token:", response)
          newOnChannel(bodyNewTicket.channel, body.id);
          res.sendStatus(201);
        }
      })
    }

    else if (response.length > 0 && body.id.toString() !== response[0].collab_id.toString()) {

      // Le token existe mais id différents
      res.sendStatus(404);
    } else {

      // Le ticket n'existe pas du tout ou pas de ticket en cours => nouveau ticket
      console.log(`No Pending Ticket (id: ${body.id})`)

      // Le token est-il dans la BDD ?
      const checkToken = 'SELECT id FROM users WHERE token = ? ';
      connection.query(checkToken, [body.token], (error, response) => {
        console.log("ici", response, body)

        if (error) res.sendStatus(500);
        else if (response.length > 0 && response[0].id.toString() === body.id.toString()) {

          // Le token est dans la BDD => nouveau ticket + nouveau channel
          console.log("Token OK")
          const bodyNewTicket = {
            channel: newChannel(response[0].id),
            collab_id: response[0].id,
            pseudo: body.pseudo,
            state: "open"
          }
          const newTicket = 'INSERT INTO tickets SET ?';
          connection.query(newTicket, [bodyNewTicket], (error, response) => {
            if (error) res.status(500).json(error)
            else {
              
              // Token et id vérifiés : un nouveau ticket est crée
              console.log("ticket.js / nouveau token:", response)
              newOnChannel(bodyNewTicket.channel);
              res.sendStatus(201);
            }
          })
        }
        else

          // Le token n'existe pas et/ou l'id ne correspond pas
          res.status(404).send({ bad_token: body.token });
      })
    }
  });
});

// Fonctions annexes // 

newChannel = (id) => {
  const date = new Date();
  const twoChars = (value) => (value < 10) ? `0${value}` : value;
  return (`${date.getFullYear()}${twoChars(date.getMonth())}${twoChars(date.getDate())}${twoChars(date.getHours())}${twoChars(date.getMinutes())}_${id}`)
}

// Socket.io
newOnChannel = (channel, id) => {
  io.to(channel).emit('waiting room', console.log(`New user (id: ${id}) on channel ${channel}`))
  // io.to(channel).emit('waiting room', console.log(`New user (id: ${id}) on channel ${channel}`))
  // Ajout d'une notification ici pour les psy ?
}


module.exports = router;
