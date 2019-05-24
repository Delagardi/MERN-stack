const express = require('express');
const request = require('request');
const config = require('config');
const route = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');

// @route  GET api/profile/me
// @desc   Geting user profile
route.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: "This user does not has the profile" });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/profile
// @desc    Creating or updating user profile
route.post('/', [
    auth, 
    [
      check('status', 'Status is required')
        .not()
        .isEmpty(),
      check('skills', 'Skills is required')
        .not()
        .isEmpty()
    ]
  ], 
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )

        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
});

// @route   GET api/profile
// @desc    Get all profiles
route.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);

    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route  GET api/profile/user/:user_id
// @desc   Get profile by user id
route.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
    
    if (!profile) {
      return res.status(400).json({ msg: "There are no profile for such user"});
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   api/profile
// @desc    Deleting profile, user and posts
route.delete('/', auth, async(req, res) => {
  try {
    // Remove profile
    await Profile.findOneAndDelete({ user: req.user.id });

    // Remove user
    await User.findOneAndDelete({ _id: req.user.id });
    
    res.json({ msg: "User deleted"});
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   api/profile/experience
// @desc    Add experience
route.put('/experience', [auth, 
  [
    check('title', 'Titile is required')
      .not()
      .isEmpty(),
    check('company', 'Company name is required')
      .not()
      .isEmpty(),
    check('location', 'Location is required')
      .not()
      .isEmpty(),
    check('from', 'Date of the begining is required')
      .not()
      .isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body;

  const newExperience = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  };

  try {
    const profile = await Profile.findOne({ user: req.user.id });

    profile.experience.unshift(newExperience);

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);

    res.status(500).send('Server error');
  }
});

// @route   api/profile/experience/:exp_id
// @desc    Deleting experience item from profile by ID
route.delete(
  '/experience/:exp_id', 
  auth, 
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // Get removing index
      const removingExp = profile.experience.find( (item) => item.id === req.params.exp_id );

      if (removingExp === undefined) {
        return res.status(400).send('There are no such experience item for this user');
      }
      
      profile.experience.splice(removingExp._id, 1);

      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   api/profile/education
// @desc    Add education in profile
route.put(
  '/education', 
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('fieldofstudy', "Field of study is required")
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEducation);

      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   api/profile/education/:educ_id
// @desc    Deleting education item
route.delete(
  '/education/:educ_id',
  auth,
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // Get item for deleting
      const removingEducation = profile.education.find( (education) => education.id === req.params.educ_id );

      if (removingEducation === undefined) {
        return res.status(400).send('There are no such education item for such user');
      }

      profile.education.splice(removingEducation._id, 1);

      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   api/profile/github/:username
// @desc    Get user's repositories
route.get(
  '/github/:username',
  async (req, res) => {
    try {
      const options = {
        uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientID')}&client_secret=${config.get(('githubClientSecret'))}`,
        method: "GET",
        headers: { "user-agent": "node.js" }
      };

      await request(options, (error, response, body) => {
        if (error) console.error(error);

        if (response.statusCode !== 200) {
          return res.status(404).send('No github profile found');
        }

        res.json(JSON.parse(body));
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
)

module.exports = route;