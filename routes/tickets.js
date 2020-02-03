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

// Clic sur le lien envoyé par mail "?token=" [collab]
router.get('/', (req, res) => {
  const token = req.query.token;
  const sql = 'SELECT id FROM users WHERE token = ?';
  connection.query(sql, [token], (error, response) => {
    console.log("26-response", response)
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
    console.log("40-response", response)
    if (error)
      console.log("42-error", error)
      // res.status(500).json(error);
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

// Affichage des tickets colturés (= closed) [psy]
router.get('/closed', (req, res) => {
  const sql = 'SELECT * FROM tickets WHERE state = "closed"';
  connection.query(sql, (error, response) => {
    if
      (error) res.status(500).json(error);
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
  console.log('134-body:', body);

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
    console.log('149-waitingTickets', response);
    if (error) res.sendStatus(500);

    else if (response.length > 0 && response[0].state === "closed") {
      // Le collaborateur a déjà fait appel au psychologue mais son ticket a été cloturé => nouveau ticket
      console.log("154-closed")
      const bodyNewTicket = {
        channel: newChannel(response[0].collab_id),
        collab_id: response[0].collab_id,
        pseudo: body.pseudo,
        state: "open"
      }
      const newTicket = 'INSERT INTO tickets SET ?';
      connection.query(newTicket, [bodyNewTicket], (error, response) => {
        console.log('163-newTicket:', bodyNewTicket, response);
        if (error) res.status(500).json(error)
        else {
          console.log("166-new token:", response)
          newOnChannel(bodyNewTicket.channel, body.id);
          res.status(201).send({ ...bodyNewTicket });
        }
      })
    }

    else if (
      response.length > 0 &&
      body.id.toString() === response[0].collab_id.toString() &&
      (response[0].state === "pending" || response[0].state === "open")) {
        // Le token est "en cours" et l'id correspond => update
      const collab = { ...response[0], pseudo: body.pseudo } // toutes les infos ici
      console.log('179-collab:', collab);
      const update = 'UPDATE tickets SET pseudo = ? WHERE id = ?';
      connection.query(update, [ collab.pseudo, collab.id], (error, response) => {
        console.log('182-update:', response, { pseudo: collab.pseudo }, collab.id);
        if (error) res.sendStatus(500);
        else {
          newOnChannel(collab.channel, body.id);
          console.log("186-update token:", collab.channel) // Token déjà open : OK
          res.status(201).send({ 
            id: body.id, 
            channel: collab.channel, 
            pseudo: body.pseudo,
            tickets_id: collab.id // utile ?
          })
        }
      })
    } 

    else if (response.length > 0 && body.id.toString() !== response[0].collab_id.toString()) {
      console.log('198-response:', response);
      // Le token existe mais id différents
      res.sendStatus(404);
    } else {

      // Le ticket n'existe pas du tout ou pas de ticket en cours => nouveau ticket
      console.log(`204-No Pending Ticket (id: ${body.id})`)

      // Le token est-il dans la BDD ?
      const checkToken = 'SELECT id FROM users WHERE token = ? ';
      connection.query(checkToken, [body.token], (error, response) => {
        console.log("210-token?:", response, body)

        if (error) res.sendStatus(500);
        else if (response.length > 0 && response[0].id.toString() === body.id.toString()) {

          // Le token est dans la BDD => nouveau ticket + nouveau channel
          console.log("215-Token OK")
          const bodyNewTicket = {
            channel: newChannel(response[0].id),
            collab_id: response[0].id,
            pseudo: body.pseudo,
            state: "open"
          }
          const newTicket = 'INSERT INTO tickets SET ?';
          connection.query(newTicket, [bodyNewTicket], (error, response) => {
            console.log('224-newTicket:', bodyNewTicket, response);
            if (error) res.status(500).json(error)
            else {

              // Token et id vérifiés : un nouveau ticket est crée
              console.log("229-nouveau token OK")
              newOnChannel(bodyNewTicket.channel, body.id);
              // global.io.emit('tickets')
              // ERREUR [ERR_HTTP_HEADERS_SENT]
              // res.send({ ...bodyNewTicket })
            }
          })
        }
        else
          console.log('237-BAD');
          // Le token n'existe pas et/ou l'id ne correspond pas
          res.status(404).send({ bad_token: body.token });
      })
    }
  });
  console.log('243-emit')
  global.io.emit('tickets')
});


// PUT //
router.put('/state/:tid', verifyToken,(req, res)=>{
  ticketId = req.params.tid
  body = req.body 
  connection.query('UPDATE tickets SET ? WHERE id = ?', [body, ticketId], (error, result)=>{
    if (error) {
      console.log(error)
      res.status(500).json({flash: error.message})
    } else {
      global.io.emit('tickets')
      res.status(200).json({flash: 'status updated'})
    }
  }) 
})

// Fonctions annexes // 

newChannel = (id) => {
  const date = new Date();
  const twoChars = (value) => (value < 10) ? `0${value}` : value;
  return (`${date.getFullYear()}${twoChars(date.getMonth())}${twoChars(date.getDate())}${twoChars(date.getHours())}${twoChars(date.getMinutes())}_${id}`)
}

// Socket.io
newOnChannel = (channel, id) => {
  io.to(channel).emit('waiting room', console.log(`New user (id: ${id}) on channel ${channel}`))
}


module.exports = router;
