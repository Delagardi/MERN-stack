const express = require('express');
const route = express.Router();

// @route GET api/profile

route.get('/', (req, res) => res.send('Profile route'));

module.exports = route;