const express = require('express');
const router = express.Router()

const connection = require('../helpers/db.js');


// GET //

// Affichage de tous les messages (superviseur) + AUTH à rajouter plus tard
// '/all'

// Affichage de tous les messages d'un Psychologue (cloturés/non cloturés) 
// '?pid='

// Affichage des messages d'un Collaborateur en particulier
// '?cid='

// Mix des 2 ?


// POST //

// Un utilisateur envoie un message sur un channel


module.exports = router;
