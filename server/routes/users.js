const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const users = require('../controllers/users');


router.put("/:id", users.updateProfile);

module.exports = router;