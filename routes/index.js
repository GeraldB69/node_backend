const express = require('express');
const messages = require('./messages');
const tickets = require('./tickets');
const users = require('./users');

const router = express.Router();

router.use('/messages', messages);
router.use('/tickets', tickets);
router.use('/users', users);

module.exports = router;
