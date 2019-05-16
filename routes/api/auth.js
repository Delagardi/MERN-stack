const express = require('express');
const route = express.Router();

// @route GET api/auth

route.get('/', (req, res) => res.send('Auth route'));

module.exports = route;