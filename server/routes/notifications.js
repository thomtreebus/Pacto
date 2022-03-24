const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { checkAuthenticated } = require("../middleware/authMiddleware");

// router.get("/notifications", checkAuthenticated, getNotifications);

router.put("/notifications/:id/update", checkAuthenticated, markAsRead);

module.exports = router;