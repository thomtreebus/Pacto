/**
 * This contains the routes regarding user authentication
 * @type {e | (() => Express)}
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.get("/verify", authController.verify);

router.get("/me", checkAuthenticated, authController.getMe);

module.exports = router;
