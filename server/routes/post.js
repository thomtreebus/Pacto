const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { checkAuthenticated } = require("../middleware/authMiddleware");
const { checkPartOfPact } = require("../middleware/checkPactMiddleware");

router.post("/post", checkAuthenticated, checkPartOfPact, postController.postPost);
router.get("/post/:id", checkAuthenticated, checkPartOfPact, postController.postGet);

module.exports = router;