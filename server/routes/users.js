const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');


router.route('/:id')
  .get(catchAsync(users.updateProfile))
  .delete(catchAsync(users.deleteUser));