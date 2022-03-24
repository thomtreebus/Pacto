const express = require("express");
const router = express.Router();
const { feedGET } = require("../controllers/feedController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.get("/feed", checkAuthenticated, feedGET);

module.exports = router;