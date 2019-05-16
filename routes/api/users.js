const express = require('express');
const route = express.Router();

// @route GET api/users

route.get('/', (req, res) => res.send('Users route'));

module.exports = route;