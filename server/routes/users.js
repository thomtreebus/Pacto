const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const users = require('../controllers/users');
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.put("/:id", checkAuthenticated, users.updateProfile);

router.get("/:id", checkAuthenticated, users.viewProfile);

router.get("/notifications", checkAuthenticated, users.getNotifications);

module.exports = router;
