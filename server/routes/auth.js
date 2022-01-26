const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// create json web token
const maxAge = 5 * 24 * 60 * 60; // 5 days
const createToken = (id) => {
  return jwt.sign({ id }, 'kekw', {
    expiresIn: maxAge
  });
};

router.post('/signup', async (req,res) => {
  const { firstName, lastName, uniEmail, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ firstName, lastName, uniEmail, password:hashedPassword });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({user});
  }
  catch(err) {
    res.status(400).json({err});
  }
});

router.post('/login', async (req,res) => {
  const { uniEmail, password } = req.body;

  try {
    const user = await User.findOne({ uniEmail });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
        return;
      } 
    }
    throw Error('incorrect credentials');
  } 
  catch (err) {
    res.status(400).json({errors: [err]});
  }

});

router.get('/logout', (req,res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
});

module.exports = router;
