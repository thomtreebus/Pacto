const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');


router.route('/:userId')
  .put(catchAsync(users.updateProfile))
  .delete(catchAsync(users.deleteUser));


// route for friend requests
router.route('/:recipientId')
  .post(catchAsync(users.sendFriendRequest));