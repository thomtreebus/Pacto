const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const { getNotifications } = require('../controllers/notificationController');
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.get("/notifications", checkAuthenticated, getNotifications);