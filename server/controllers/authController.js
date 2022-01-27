const User = require("../models/User");
const EmailVerificationCode = require("../models/EmailVerificationCode");
const { handleVerification } = require("../helpers/emailHandlers");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const { async } = require("crypto-random-string");

// Magic numbers
const COOKIE_MAX_AGE = 432000; // 432000 = 5 days
const SALT_ROUNDS = 10;

// Helper method to generate JWT
const createToken = (id) => {
	return jwt.sign({ id }, "kekw", {
		expiresIn: COOKIE_MAX_AGE,
	});
};

module.exports.createToken = createToken;

// POST /signup
module.exports.signupPost = async (req, res) => {
	const { firstName, lastName, uniEmail, password } = req.body;

	try {
		// Hash password
		const salt = await bcrypt.genSalt(SALT_ROUNDS);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = await User.create({
			firstName,
			lastName,
			uniEmail,
			password: hashedPassword,
		});

		// Generate verification string and send to user's email
		await handleVerification(uniEmail, user._id);

		res.status(201).json(jsonResponse(null, []));
	} catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

// POST /login
module.exports.loginPost = async (req, res) => {
	const { uniEmail, password } = req.body;

	try {
		const user = await User.findOne({ uniEmail });

		if (!user) {
			throw Error("Incorrect credentials.");
		}

		// Check input vs hashed, stored password
		const auth = await bcrypt.compare(password, user.password);

		if (!auth) {
			throw Error("Incorrect credentials.");
		}

		if (!user.active) {
			throw Error("University email not yet verified.");
		}

		// Generate cookie to log in user
		const token = createToken(user._id);
		res.cookie("jwt", token, { httpOnly: true, maxAge: COOKIE_MAX_AGE * 1000 });
		res.status(200).json(jsonResponse({ id: user._id }, []));
	} catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

// GET /logout
module.exports.logoutGet = (req, res) => {
	res.cookie("jwt", "", { maxAge: 1 });
	// console.log(req.user);
	res.status(200).json(jsonResponse(null, []));
};

// GET /verify
module.exports.verifyGet = async (req, res) => {
	try {
		// Get code from query param
		const code = req.query.code;
		if (!code) {
			throw Error("Code query empty.");
		}

		// Find associated user and make them active.
		const linker = await EmailVerificationCode.findOne({ code });
		if (!linker) {
			throw Error("Invalid or expired code.");
		}

		const user = await User.findByIdAndUpdate(linker.userId, { active: true });
		await linker.delete();
		res.status(200).send("Success! You may now close this page.");
	} catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

module.exports.meGet = async (req, res) => {
	res.status(200).json(jsonResponse(req.user, []));
};
