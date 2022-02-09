const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.post("/post", checkAuthenticated, postController.postPost);
router.get("/post/:id", checkAuthenticated, postController.postGet);

module.exports = router;