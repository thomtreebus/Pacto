const express = require("express");
const router = express.Router();
const universityController = require("../controllers/universityController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.get("/university", universityController.universityGet, checkAuthenticated);

module.exports = router;