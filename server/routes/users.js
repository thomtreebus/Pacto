const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const users = require('../controllers/users');
const { checkAuthenticated } = require("../middleware/authMiddleware");


router.put("/:id", checkAuthenticated, users.updateProfile);

module.exports = router;