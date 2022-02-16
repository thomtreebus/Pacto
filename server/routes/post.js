const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.post("/pact/:pactId/post", checkAuthenticated, postController.postPost);
router.get("/pact/:pactId/post/:postId", checkAuthenticated, postController.postGet);
router.post("/pact/:pactId/post/upvote/:postId", checkAuthenticated, postController.upvotePostPost);
router.post("/pact/:pactId/post/downvote/:postId", checkAuthenticated, postController.downvotePostPost);

module.exports = router;