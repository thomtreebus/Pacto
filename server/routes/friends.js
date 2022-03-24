const express = require('express');
const router = express.Router();
const friends = require('../controllers/friendController');
const { checkAuthenticated } = require("../middleware/authMiddleware");

// routes for friends

// requests
router.post('/friends/:id', checkAuthenticated, friends.sendFriendRequest);
router.put('/friends/:id/accept', checkAuthenticated, friends.acceptFriendRequest);
router.put('/friends/:id/reject', checkAuthenticated, friends.rejectFriendRequest);

// removal:
router.put('/friends/remove/:id', checkAuthenticated, friends.removeFriend);

module.exports = router;