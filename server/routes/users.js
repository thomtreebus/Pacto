const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.put('/:id', checkAuthenticated, users.updateProfile);
router.get("/:id", checkAuthenticated, users.viewProfile);

module.exports = router;
