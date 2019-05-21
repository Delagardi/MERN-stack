const express = require('express');
const route = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');

// @route GET api/auth

route.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ msg: "Server error" });
  }
});

// @route POST api/auth

route.post('/', [
    check('email', 'Email is required'),
    check('password', 'Password is required')
  ],
  async (req, res) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()});
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: "Email or password are invalid"}]});
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: "Email or password are invalid"}]});
      }

      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 }, // in sec
        (error, token) => {
          if (error) throw error;

          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
})

module.exports = route;