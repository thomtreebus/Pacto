const express = require("express");
const router = express.Router();
const universityController = require("../controllers/universityController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.get("/university", checkAuthenticated, universityController.universityGet);

module.exports = router;