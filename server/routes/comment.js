const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const { checkIsMemberOfPact } = require("../middleware/pactMiddleware");
const { checkValidPost, checkValidPostComment } = require("../middleware/postMiddleware");

router.post("/pact/:pactId/post/:postId/comment", checkAuthenticated, checkIsMemberOfPact, checkValidPost, commentController.createComment);

router.delete("/pact/:pactId/post/:postId/comment/:commentId", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, commentController.deleteComment);
router.get("/pact/:pactId/post/:postId/comment/:commentId", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, commentController.getComment);

router.put("/pact/:pactId/post/:postId/comment/:commentId/upvote", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, commentController.upvoteComment);
router.put("/pact/:pactId/post/:postId/comment/:commentId/downvote", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, commentController.downvoteComment);

router.post("/pact/:pactId/post/:postId/comment/:commentId/reply", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, commentController.createReplyToComment);

module.exports = router;