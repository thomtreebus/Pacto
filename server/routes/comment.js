const express = require("express");
const router = express.Router();
const { createComment, deleteComment, getComment, upvoteComment, downvoteComment, createReplyToComment } = require("../controllers/comment");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const { checkIsMemberOfPact } = require("../middleware/pactMiddleware");
const { checkValidPost, checkValidPostComment } = require("../middleware/postMiddleware");

router.post("/pact/:pactId/post/:postId/comment", checkAuthenticated, checkIsMemberOfPact, checkValidPost, createComment);

router.delete("/pact/:pactId/post/:postId/comment/:commentId", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, deleteComment);
router.get("/pact/:pactId/post/:postId/comment/:commentId", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, getComment);

router.put("/pact/:pactId/post/:postId/comment/:commentId/upvote", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, upvoteComment);
router.put("/pact/:pactId/post/:postId/comment/:commentId/downvote", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, downvoteComment);

router.post("/pact/:pactId/post/:postId/comment/:commentId/reply", checkAuthenticated, checkIsMemberOfPact, checkValidPost, checkValidPostComment, createReplyToComment);

module.exports = router;