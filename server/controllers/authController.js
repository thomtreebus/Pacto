const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jsonResponse, jsonError } = require('../responseHandlers');

// Magic numbers
const COOKIE_MAX_AGE = 432000; // 432000 = 5 days
const SALT_ROUNDS = 10;

// Helper method to generate JWT
const createToken = (id) => {
  return jwt.sign({ id }, 'kekw', {
    expiresIn: COOKIE_MAX_AGE
  });
};

// POST /signup
module.exports.signupPost = async (req, res) => {
  const { firstName, lastName, uniEmail, password } = req.body;

  try {
    // Hash password
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ firstName, lastName, uniEmail, password:hashedPassword });

    // Generate cookie to log in user
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: COOKIE_MAX_AGE * 1000 });
    res.status(201).json(jsonResponse(user, []));
  }
  catch(err) {
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

// POST /login
module.exports.loginPost = async (req, res) => {
  const { uniEmail, password } = req.body;

  try {
    const user = await User.findOne({ uniEmail });

    if (!user) {
      throw Error('Incorrect credentials!');
    }

    // Check input vs hashed, stored password
    const auth = await bcrypt.compare(password, user.password);

    if (!auth) {
      throw Error('Incorrect credentials!');
    }

    // Generate cookie to log in user
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: COOKIE_MAX_AGE * 1000 });
    res.status(200).json(jsonResponse(user._id, []));
  } 
  catch (err) {
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

// GET /logout
module.exports.logoutGet = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  // console.log(req.user);
  res.status(200).json(jsonResponse(null, []));
}