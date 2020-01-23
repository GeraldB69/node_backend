// Déclaration des librairies
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const connection = require('./helpers/db.js');
const bodyParser = require('body-parser');
const router = require('./routes');
const cors = require('cors');
const port = 4000;

const sendMessage = require('./routes/messages');

// Configuration de l'application
// const connection = require('./helpers/db.js');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use((req,res,next)=>{
  console.log(req.method," ",req.originalUrl)
  next()
})

// Récupérer les infos qui passent...
app.use((req, res, next) => {
  const infos = { ...req.body }
  // console.log("21. req.body:", infos);
  next();
});

// Router
app.use('/', router);

// Socket.io
io.on('connection', function (socket) {
  console.log('a user connected', socket.id)

  socket.on('waiting room', function (id) {
    socket.join(id, ()=>{
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

    console.log("message:", objet)
    const body = { 
      message: objet.message,
      sender_id: objet.sender_id,
      tickets_id: objet.ticket_id
    }
    const newMessageSql = 'INSERT INTO messages SET ? ';
    (req,res) => connection.query(newMessageSql, [body], (error, response) => {
      if (error) 
        // res.status(500).json(error)
        console.log(error)
      else {
        console.log(response)
      }
    })
      // const { body } = req
    
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
