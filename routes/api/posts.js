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

// @route   GET api/post/:post_id
// @desc    GET post by post ID
route.get(
  '/:post_id', 
  auth, 
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.post_id);

      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }

      res.json(post);
    } catch (error) {
      console.error(error.message);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Post not found' });
      }

      res.status(500).send('Server error');
    }
  }
);

// @route  DELETE api/posts/:post_id
// @desc   Delete post by post ID
route.delete(
  '/:post_id',
  auth,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.post_id);

      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }

      if (post.user.toString() !== req.user.id) {
        return res.status(401).send('User is not authorized');
      }

      await post.remove();

      res.json({ msg: 'Post removed'});
    } catch (error) {
      console.error(error.message);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Post not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/posts/like/:post_id
// @desc    Like post by post_id
route.put(
  '/like/:post_id',
  auth,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.post_id);

      // Check if the post has been already liked by this user
      if (
        post.likes
          .filter( 
            (like) => like.user.toString() === req.user.id )
          .length > 0) {
            return res.status(400).json({ msg: "Post already liked" });
      }

      post.likes.unshift({ user: req.user.id });

      await post.save();

      res.json(post.likes);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);


// @route   PUT api/posts/unlike/:post_id
// @desc    Like post by post_id
route.put(
  '/unlike/:post_id',
  auth,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.post_id);

      // Check if the post has been already liked by this user
      if (
        post.likes
          .filter( 
            (like) => like.user.toString() === req.user.id )
          .length === 0) {
            return res.status(400).json({ msg: "Post has not yet been liked" });
      }

      const removeIndex = post.likes
        .map( (like) => like.user.toString())
        .indexOf(req.user.id);

      post.likes.splice(removeIndex, 1);

      await post.save();

      res.json(post.likes);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = route;