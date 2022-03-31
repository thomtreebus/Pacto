const express = require("express");
const router = express.Router();
const pactController = require("../controllers/pactController");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const { checkIsMemberOfPact, checkIsModeratorOfPact } = require("../middleware/pactMiddleware");

router.post("/pact", checkAuthenticated, pactController.createPact);
router.post("/pact/:id/join", checkAuthenticated, pactController.joinPact);
router.get("/pact/:pactId", checkAuthenticated, checkIsMemberOfPact, pactController.getPact);
router.put("/pact/:pactId", checkAuthenticated, checkIsMemberOfPact, pactController.updatePact);
router.put("/pact/:pactId/:userId/ban", checkAuthenticated, checkIsMemberOfPact, checkIsModeratorOfPact, pactController.banMember);
router.put("/pact/:pactId/:userId/promote", checkAuthenticated, checkIsMemberOfPact, checkIsModeratorOfPact, pactController.promoteMember);
router.put("/pact/:pactId/:userId/revokeban", checkAuthenticated, checkIsMemberOfPact, checkIsModeratorOfPact, pactController.revokeBan);
router.delete("/pact/:pactId/leave", checkAuthenticated, checkIsMemberOfPact, pactController.leavePact);
router.delete("/pact/:pactId/delete", checkAuthenticated, checkIsMemberOfPact, checkIsModeratorOfPact, pactController.deletePact);

module.exports = router;
