const express = require("express");
const router = express.Router();
const { createPact, getPact, editPact, joinPact, banMember, promoteMember, revokeBan, leavePact, deleteAllComments, deletePact } = require("../controllers/pactController");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const { checkIsMemberOfPact, checkIsModeratorOfPact } = require("../middleware/pactMiddleware");

router.post("/pact", checkAuthenticated, createPact);
router.post("/pact/:id/join", checkAuthenticated, joinPact);
router.get("/pact/:pactId", checkAuthenticated, checkIsMemberOfPact, getPact);
router.put("/pact/:pactId", checkAuthenticated, checkIsMemberOfPact, editPact);
router.put("/pact/:pactId/:userId/ban", checkAuthenticated, checkIsMemberOfPact, checkIsModeratorOfPact, banMember);
router.put("/pact/:pactId/:userId/promote", checkAuthenticated, checkIsMemberOfPact, checkIsModeratorOfPact, promoteMember);
router.put("/pact/:pactId/:userId/revokeban", checkAuthenticated, checkIsMemberOfPact, checkIsModeratorOfPact, revokeBan);
router.delete("/pact/:pactId/leave", checkAuthenticated, checkIsMemberOfPact, leavePact);
router.delete("/pact/:pactId/delete", checkAuthenticated, checkIsMemberOfPact, checkIsModeratorOfPact, deletePact);

module.exports = router;
