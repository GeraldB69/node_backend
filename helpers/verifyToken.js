const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const bearerHeader = req.headers.authorization
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ')
      const bearerToken = bearer[1]
      req.token = bearerToken
      jwt.verify(bearerToken, 'HPI_secretKey', (err, payload) => {
        if (err) {
          console.log('token invalid')
          res.sendStatus(401)
        }
        else {
          req.user = payload
          next()
        }
      })
    } else {
      res.sendStatus(403)
    }
  }

  module.exports = verifyToken
