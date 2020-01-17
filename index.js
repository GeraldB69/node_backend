// Déclaration des librairies
const app = require('express')();
// const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const router = require('./routes');
const cors = require('cors');
const port = 4000;

global.channel = '';

// Configuration de l'application
// const connection = require('./helpers/db.js');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Récupérer les infos qui passent...
app.use((req, res, next) => {
  const infos = { ...req.body }
  console.log(infos);
  next();
});

// Router
app.use('/', router);

// Socket.io
let users = [];

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('waiting room', function (id) {
    console.log("socket has joined the waiting room", id);
    socket.join(id)
  })

  socket.on('leave room', (id) =>{
    console.log("socket has leaved room", id);
    io.to(id).emit('waiting room', {message:"presque parti"})
    socket.leave(id , (err,res) =>   console.log(socket.adapter.rooms)
    ) 
    io.to(id).emit('waiting room', {message:"parti"}) 
  }) 

  socket.on("message", function (objet) {
    console.log("message:", objet.message) 
    io.to((objet.channel)).emit('waiting room', objet) 
    // socket.broadcast.to("waiting room").emit('waiting room', payload.msg)
  })

  socket.on('disconnect', function (t) { 
    console.log("discon", user)
    users = users.filter(u => u !== user.username)
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
