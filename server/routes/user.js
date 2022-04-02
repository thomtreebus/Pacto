const express = require('express');
const router = express.Router();
const { updateProfile, getProfile, getUniversityUsers } = require('../controllers/user');
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.put('/users/:id', checkAuthenticated, updateProfile);
router.get("/users/:id", checkAuthenticated, getProfile);

router.get("/users/", checkAuthenticated, getUniversityUsers);

module.exports = router;
