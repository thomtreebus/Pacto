const express = require("express");
const router = express.Router();
const { getFeed } = require("../controllers/feedController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.get("/feed", checkAuthenticated, getFeed);

module.exports = router;