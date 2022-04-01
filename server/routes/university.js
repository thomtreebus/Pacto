const express = require("express");
const router = express.Router();
const { getUniversity, getSearchResults } = require("../controllers/university");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.get("/university", checkAuthenticated, getUniversity);
router.get("/search/:query", checkAuthenticated, getSearchResults);

module.exports = router;