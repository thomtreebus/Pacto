/**
 * This contains the routes regarding user authentication
 * @type {e | (() => Express)}
 */

const express = require("express");
const router = express.Router();
const { signup, login, logout, verify, getMe } = require("../controllers/authController");
const { checkAuthenticated } = require("../middleware/authMiddleware");

router.post("/signup", signup);

router.post("/login", login);

router.get("/logout", logout);

router.get("/verify", verify);

router.get("/me", checkAuthenticated, getMe);

module.exports = router;
