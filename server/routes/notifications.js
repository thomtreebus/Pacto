const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationController');
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.get("/notifications", checkAuthenticated, getNotifications);

module.exports = router;