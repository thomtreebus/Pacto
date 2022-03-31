const express = require("express");
const router = express.Router();
const { createPost, getPost, upvotePost, downvotePost, deletePost } = require("../controllers/postController");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const { checkIsMemberOfPact } = require("../middleware/pactMiddleware");


router.post("/pact/:pactId/post", checkAuthenticated, checkIsMemberOfPact, createPost);
router.get("/pact/:pactId/post/:postId", checkAuthenticated, checkIsMemberOfPact, getPost);
router.put("/pact/:pactId/post/upvote/:postId", checkAuthenticated, checkIsMemberOfPact, upvotePost);
router.put("/pact/:pactId/post/downvote/:postId", checkAuthenticated, checkIsMemberOfPact, downvotePost);
router.delete("/pact/:pactId/post/:postId", checkAuthenticated, checkIsMemberOfPact, deletePost);

module.exports = router;