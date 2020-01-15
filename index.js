// Déclaration des librairies
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const router = require('./routes');
const port = 4000;


// Configuration de l'application
const connection = require('./helpers/db.js'); // Pour info, non utilisé ici
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/', router);

// Test de l'API
app.get("/", (req,res) => {
  res.send("OK...");
});

// Erreur 404 / 'Not Found'
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Lancement du serveur
let server = app.listen(port, (err) => {
  if (err) {
    throw new Error('Something bad happened...');
  }
  console.log('Listening on port ' + server.address().port);
});
