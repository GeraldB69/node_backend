const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../helpers/verifyToken')
const helpers = require('../helpers/db.js');


// GET // 

// liste de tous les pyschologues
router.get('/psy/all', verifyToken, (req, res) => {
  const sql = "SELECT * FROM users WHERE role LIKE 'psy%'";
  helpers.connection.query(sql, (error, response) => {
    if (error)
      res.status(500).json(error);
    else
      res.status(200).json(response)
  })
})

// Compteur des psychologues dispo. (role = 'psy_online')
router.get('/psy_on', (req, res) => {
  const status = 'psy_online';
  const sql = 'SELECT id FROM users WHERE role = ?';
  helpers.connection.query(sql, [status], (error, response) => {
    if (error) res.status(500).json(error);
    else res.status(200).json(response.length)
  })
})

// Compteur des psychologues occupés (role = 'psy_busy')
router.get('/psy_busy', (req, res) => {
  const status = 'psy_busy';
  const sql = 'SELECT id FROM users WHERE role = ?';
  helpers.connection.query(sql, [status], (error, response) => {
    if (error) res.status(500).json(error);
    else res.status(200).json(response.length)
  })
})

// Compteur des psychologues indisponibles (role = 'psy_offline')
router.get('/psy_off', (req, res) => {
  const status = 'psy_offline';
  const sql = 'SELECT id FROM users WHERE role = ?';
  helpers.connection.query(sql, [status], (error, response) => {
    if (error) res.status(500).json(error);
    else res.status(200).json(response.length)
  })
})

// POST //

router.post('/auth/admin', (req, res) => {
  const id = req.body.data
  helpers.connection.query('SELECT * FROM users WHERE email = ?', [id.email], (error, response) => {
    if (error) res.status(500).json(error);
    else if (response.length > 0) {
      if (response[0].password === id.password) {
        console.log('Identification OK')
        user = response[0]
        username = `${user.firstname} ${user.lastname}`
        userId = user.id
        jwt.sign({ user }, 'HPI_secretKey', (err, token) => {
          res.status(200).json({
            token,
            username,
            id: user.id
          })
        }) 
      } else {
        console.log("Mot de passe invalide")
        res.status(401).json({ message: "Mot de passe invalide" })
      }
    } else {
      console.log("email invalide")
      res.status(401).json({ message: "Email invalide" })
    }
  })
})

// PUT //
router.put('/auth/admin/:pid', verifyToken,(req, res)=>{
  psyId = req.params.pid
  role = req.body 
  helpers.connection.query('UPDATE users SET ? WHERE id = ?', [role, psyId], (error, result)=>{
    if (error) {
      res.status(500).json({flash: error.message})
    } else {
      global.io.emit('psychologues')
      res.status(200).json({flash: 'status updated'})
    }
  }) 
})


module.exports = router;
