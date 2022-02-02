const User = require("../models/User");
const EmailVerificationCode = require("../models/EmailVerificationCode");
const { handleVerification } = require("../helpers/emailHandlers");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const { async } = require("crypto-random-string");
const ApiCache = require("../helpers/ApiCache");
const University = require("../models/University");
const passwordValidator = require('password-validator');

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

const validPassword = (password) => {
  const validator = (new passwordValidator())
    .is().min(8)
    .is().max(64)
    .has().uppercase()
    .has().lowercase()
    .has().digits(1);
  return validator.validate(password)
}

// POST /signup
module.exports.signupPost = async (req, res) => {
	const { firstName, lastName, uniEmail, password } = req.body;
	const processedEmail = uniEmail.toLowerCase()
	let errorField = null;

	try {
		// Hash password
		const salt = await bcrypt.genSalt(SALT_ROUNDS);
		const hashedPassword = await bcrypt.hash(password, salt);

		if (!validPassword(password)){
			errorField = "password";
			throw Error("Password does not meet requirements");
		}

		// Check if the provided email is associated with a domain in the university API.
		const universityJson = await ApiCache(process.env.UNIVERSITY_API);

		const userDomain = processedEmail.split('@')[1];
		const entry = await universityJson.filter(uni => uni["domains"].includes(userDomain));
		if (entry.length == 0) {
			errorField = "uniEmail";
			throw Error("Email not associated with a UK university");
		}

		// Convert array of 1 item to the item
		const uniDetails = entry[0];

		// Get the relevant university from the database.
		// If it doesn't exist: make one.
		let university = await University.findOne({ domains: uniDetails["domains"] });
		if (!university) {
			university = await University.create({ name:uniDetails["name"], domains:uniDetails["domains"] });
		}
		// We don't include the user in the university users list until they verify their email.

		const user = await User.create({ firstName, lastName, uniEmail:processedEmail, password:hashedPassword, university });

		// Generate verification string and send to user's email
		await handleVerification(uniEmail, user._id);

		res.status(201).json(jsonResponse(null, []));
	}
	catch(err) {
		res.status(400).json(jsonResponse(null, [jsonError(errorField, err.message)]));
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
	} 
  catch (err) {
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

		// Add user to their university
		const user = await User.findByIdAndUpdate(linker.userId, { active: true });
		await University.findByIdAndUpdate(user.university, {$push: {users: user}});

		await linker.delete();
		res.status(200).send("Success! You may now close this page.");
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

module.exports.meGet = async (req, res) => {
	res.status(200).json(jsonResponse(req.user, []));
};
