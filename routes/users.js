const express = require('express');
const router = express.Router()

const connection = require('../helpers/db.js');


// GET // 

// Compteur des psychologues dispo. (role = 'psy_online')
router.get('/psy_on', (req, res) => {
  const status = 'psy_online';
  const sql = 'SELECT id FROM users WHERE role = ?';
  connection.query(sql, [status], (error, response) => {
    if (error) 
      res.status(500).json(error);
    else
      res.status(200).json(response.length)
  })
})

// Compteur des psychologues occupés (role = 'psy_busy')
router.get('/psy_busy', (req, res) => {
  const status = 'psy_busy';
  const sql = 'SELECT id FROM users WHERE role = ?';
  connection.query(sql, [status], (error, response) => {
    if (error) 
      res.status(500).json(error);
    else
      res.status(200).json(response.length)
  })
})

// Compteur des psychologues indisponibles (role = 'psy_offline')
router.get('/psy_off', (req, res) => {
  const status = 'psy_offline';
  const sql = 'SELECT id FROM users WHERE role = ?';
  connection.query(sql, [status], (error, response) => {
    if (error) 
      res.status(500).json(error);
    else
      res.status(200).json(response.length)
  })
})



module.exports = router;
