const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');

router.put('/:userId', checkAuthenticated, users.updateProfile);
router.delete('/:userId', checkAuthenticated, users.deleteUser);

  // route for friend requests
router.post('/:recipientId', checkAuthenticated, users.sendFriendRequest);
router.put('/:friendRequestId/accept', checkAuthenticated, users.acceptFriendRequest);
router.put('/:friendRequestId/reject', checkAuthenticated, users.rejectFriendRequest);