const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const { checkIsMemberOfPact } = require("../middleware/pactMiddleware");

router.post("/pact/:pactId/post", checkAuthenticated, checkIsMemberOfPact, postController.postPost);
router.get("/pact/:pactId/post/:postId", checkAuthenticated, checkIsMemberOfPact, postController.postGet);
router.post("/pact/:pactId/post/upvote/:postId", checkAuthenticated, checkIsMemberOfPact, postController.upvotePostPost);
router.post("/pact/:pactId/post/downvote/:postId", checkAuthenticated, checkIsMemberOfPact, postController.downvotePostPost);
router.delete("/pact/:pactId/post/:postId", checkAuthenticated, checkIsMemberOfPact, postController.postDelete);

module.exports = router;