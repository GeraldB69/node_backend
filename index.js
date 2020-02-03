// Déclaration des librairies
const exp = require('express');
const app = exp();
const server = require('http').Server(app);
const io = require('socket.io')(server);
global.io = io; //added
const connection = require('./helpers/db.js');
const bodyParser = require('body-parser');
const router = require('./routes');
const cors = require('cors');
let port = 4000;
// port = 80; // Cas du VPS


// Configuration de l'application
// app.use('/', exp.static('../lyon-sept19-projet3-groupehpi-front/build'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use((req, res, next) => {
  console.log(req.method, " ", req.originalUrl)
  next()
})

// Router
app.use('/api', router);

// Socket.io
io.on('connection', function (socket) {
  console.log('a user connected', socket.id)

  socket.on('waiting room', function (id) {
    socket.join(id, () => {
      console.log("socket has joined the waiting room", socket.id);
    })
    io.to((socket.id)).emit('waiting room', socket.id)
  })

  socket.on('leave room', object => {
    socket = io.sockets.connected[object.clientId]
    socket.leave(object.channel, () => {
      console.log(`${socket.id} has leaved room ${object.channel}`);
    })
  })

  socket.on("message", function (objet) {
    // objet = { message: message, user: this.state.user, channel: this.channel }

    const body = {
      message: objet.message,
      sender_id: objet.sender_id,
      tickets_id: objet.tickets_id
    }
    if (objet.sender_id > 0) {
      const newMessageSql = 'INSERT INTO messages SET ? ';
      connection.query(newMessageSql, [body], (error, response) => {
        if (error)
          // res.status(500).json(error)
          console.log("error:", error)
        else {
          console.log(`index.js / New message with ID ${response.insertId} `)
        }
      })
    }
    io.to((objet.channel)).emit('waiting room', objet)
  })

  socket.on('disconnect', function (t) {
    console.log("disconnect")
  });
});

// Test de l'API
app.get("/", (req, res) => {
  console.log("OK...")
  res.send("OK...");
});


// Erreur 404 / 'Not Found'
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Lancement du serveur
server.listen(port, (err) => {
  if (err) {
    throw new Error('Something bad happened...');
  }
  console.log('Listening on port ' + server.address().port);
});
