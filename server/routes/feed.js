const express = require("express");
const router = express.Router();
const { getFeed } = require("../controllers/feed");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.get("/feed", checkAuthenticated, getFeed);

module.exports = router;