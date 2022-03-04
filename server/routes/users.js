const express = require('express');
const router = express.Router();
const User = require('../models/User');
const users = require('../controllers/users');
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.put('/:userId', checkAuthenticated, users.updateProfile);
router.delete('/:userId', checkAuthenticated, users.deleteUser);

// routes for friends

// requests:
router.post('/friends/:recipientId', checkAuthenticated, users.sendFriendRequest);
router.put('/friends/:friendRequestId/accept', checkAuthenticated, users.acceptFriendRequest);
router.put('/friends/:friendRequestId/reject', checkAuthenticated, users.rejectFriendRequest);

// removal:
router.put('/friends/remove/:friendToRemoveId', checkAuthenticated, users.removeFriend);

module.exports = router;