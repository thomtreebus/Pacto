const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const { checkIsMemberOfPact } = require("../middleware/pactMiddleware");

router.post("/pact/:pactId/post/:postId/comment", checkAuthenticated, checkIsMemberOfPact, commentController.commentPost);

router.delete("/pact/:pactId/post/:postId/comment/:commentId", checkAuthenticated, checkIsMemberOfPact, commentController.commentDelete);
router.get("/pact/:pactId/post/:postId/comment/:commentId", checkAuthenticated, checkIsMemberOfPact, commentController.commentGet);

router.put("/pact/:pactId/post/:postId/comment/:commentId/upvote", checkAuthenticated, checkIsMemberOfPact, commentController.commentUpvotePut);
router.put("/pact/:pactId/post/:postId/comment/:commentId/downvote", checkAuthenticated, checkIsMemberOfPact, commentController.commentDownvotePut);

module.exports = router;