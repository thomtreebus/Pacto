const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const { checkIsMemberOfPact } = require("../middleware/pactMiddleware");
const { checkValidPost, checkValidPostComment } = require("../middleware/postMiddleware");

router.post("/pact/:pactId/post/:postId/comment", checkAuthenticated, checkIsMemberOfPact, checkValidPost, commentController.commentPost);

router.delete("/pact/:pactId/post/:postId/comment/:commentId", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, commentController.commentDelete);
router.get("/pact/:pactId/post/:postId/comment/:commentId", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, commentController.commentGet);

router.put("/pact/:pactId/post/:postId/comment/:commentId/upvote", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, commentController.commentUpvotePut);
router.put("/pact/:pactId/post/:postId/comment/:commentId/downvote", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, commentController.commentDownvotePut);

router.post("/pact/:pactId/post/:postId/comment/:commentId/reply", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, commentController.commentReplyPost);

module.exports = router;