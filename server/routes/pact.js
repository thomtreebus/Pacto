const express = require("express");
const router = express.Router();
const pactController = require("../controllers/pactController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.post("/pact", checkAuthenticated, pactController.pactPost);

module.exports = router;