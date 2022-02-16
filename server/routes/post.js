const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.post("/post/:pactid", checkAuthenticated, postController.postPost);
router.post("/post/upvote/:pactid/:id", checkAuthenticated, postController.upvotePostPost);
router.post("/post/downvote/:pactid/:id", checkAuthenticated, postController.downvotePostPost);
router.get("/post/:pactid/:id", checkAuthenticated, postController.postGet);

module.exports = router;