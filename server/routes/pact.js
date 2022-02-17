const express = require("express");
const router = express.Router();
const pactController = require("../controllers/pactController");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const { checkIsMemberOfPact } = require("../middleware/pactMiddleware");

router.post("/pact", checkAuthenticated, pactController.pactPost);
router.get("/pact/:pactId", checkAuthenticated, checkIsMemberOfPact, pactController.pactGet);

module.exports = router;