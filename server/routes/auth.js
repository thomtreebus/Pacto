const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signupPost);

router.post('/login', authController.loginPost);

router.get('/logout', authController.logoutGet);

module.exports = router;