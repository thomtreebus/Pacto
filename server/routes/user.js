const express = require('express');
const router = express.Router();
const { updateProfile, getProfile, getUniversityUsers } = require('../controllers/user');
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.put('/:id', checkAuthenticated, updateProfile);
router.get("/:id", checkAuthenticated, getProfile);

router.get("/", checkAuthenticated, getUniversityUsers);

module.exports = router;
