const express = require('express');
const route = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Post = require('../../models/Post');

// @route   POST api/posts
// @desc    Create post
route.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) =>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()});
    }
  
    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        user: req.user.id,
        avatar: user.avatar
      })

      await newPost.save();

      res.json(newPost);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }

  }
);

// @route   GET api/posts
// @desc    Get all posts
route.get(
  '/',
  auth,
  async (req, res) => {
    try {
      const posts = await Post.find().sort({ date: -1});

      res.json(posts);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);



module.exports = route;