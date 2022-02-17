const express = require("express");
const router = express.Router();
const pactController = require("../controllers/pactController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.post("/pact", checkAuthenticated, pactController.pactPost);
router.get("/pact/:id", checkAuthenticated, pactController.pactGet);
router.post("/pact/:id/join", checkAuthenticated, pactController.joinPact);
// router.get("/pacts", checkAuthenticated, pactController.pactsGet);

module.exports = router;
