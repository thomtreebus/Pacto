const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.post("/post/:pactid", checkAuthenticated, postController.postPost);
router.get("/post/:pactid/:id", checkAuthenticated, postController.postGet);

module.exports = router;