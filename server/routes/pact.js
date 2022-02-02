const express = require("express");
const router = express.Router();
const pactController = require("../controllers/pactController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.post("/pact", checkAuthenticated, pactController.pactPost);
router.get("/pact", checkAuthenticated, ()=>{});
router.get("/pacts", checkAuthenticated, pactController.pactsGet);

module.exports = router;