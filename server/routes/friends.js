const express = require('express');
const router = express.Router();
const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, deleteFriend } = require('../controllers/friend');
const { checkAuthenticated } = require("../middleware/authMiddleware");

// routes for friends

// requests
router.post('/friends/:id', checkAuthenticated, sendFriendRequest);
router.put('/friends/:id/accept', checkAuthenticated, acceptFriendRequest);
router.put('/friends/:id/reject', checkAuthenticated, rejectFriendRequest);

// removal:
router.put('/friends/remove/:id', checkAuthenticated, deleteFriend);

module.exports = router;