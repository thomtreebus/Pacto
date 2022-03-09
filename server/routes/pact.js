const express = require("express");
const router = express.Router();
const pactController = require("../controllers/pactController");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const { checkIsMemberOfPact, checkIsModeratorOfPact } = require("../middleware/pactMiddleware");

router.post("/pact", checkAuthenticated, pactController.pactPost);
router.post("/pact/:id/join", checkAuthenticated, pactController.joinPact);
router.get("/pact/:pactId", checkAuthenticated, checkIsMemberOfPact, pactController.pactGet);
router.put("/pact/:pactId/:userId/ban", checkAuthenticated, checkIsMemberOfPact, checkIsModeratorOfPact, pactController.banMember);
router.put("/pact/:pactId/:userId/promote", checkAuthenticated, checkIsMemberOfPact, checkIsModeratorOfPact, pactController.promoteMember);

module.exports = router;
