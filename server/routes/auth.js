/**
 * This contains route regarding user authentication
 * @type {e | (() => Express)}
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.post("/signup", authController.signupPost);

router.post("/login", authController.loginPost);

router.get("/logout", authController.logoutGet);

router.get("/verify", authController.verifyGet);

router.get("/me", checkAuthenticated, authController.meGet);

module.exports = router;
