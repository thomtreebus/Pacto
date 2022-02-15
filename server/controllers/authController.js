const User = require("../models/User");
const EmailVerificationCode = require("../models/EmailVerificationCode");
const { handleVerification } = require("../helpers/emailHandlers");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const { async } = require("crypto-random-string");
const ApiCache = require("../helpers/ApiCache");
const University = require("../models/University");
const { MESSAGES } = require("../helpers/messages");
const {passwordValidators} = require('../helpers/customSignupValidators')
const { isEmail } = require('validator');
const handleFieldErrors = require("../helpers/fieldErrorsHandler");

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
	const processedEmail = uniEmail.toLowerCase()
	let jsonErrors = [];
	let errorFound = false;

	try {
		// Hash password
		const salt = await bcrypt.genSalt(SALT_ROUNDS);
		const hashedPassword = await bcrypt.hash(password, salt);

		if(password) {
			passwordValidators.forEach((handler) => {
				if(!handler.validator(password)){
					jsonErrors.push(jsonError("password", handler.message));
					errorFound = true;
				}
			});
		}
		else	{
			jsonErrors.push(jsonError("password", MESSAGES.PASSWORD.BLANK));
			errorFound = true;
		}

		let university = null;
		
		// Check if the provided email is associated with a domain in the university API.
		const universityJson = await ApiCache(process.env.UNIVERSITY_API);
		const userDomain = processedEmail.split('@')[1];
		const entry = universityJson.filter(uni => uni["domains"].includes(userDomain));
		if (!processedEmail){
			jsonErrors.push(jsonError("uniEmail", MESSAGES.EMAIL.BLANK));
			errorFound = true;
		}
		else if (!isEmail(processedEmail)){
			jsonErrors.push(jsonError("uniEmail", MESSAGES.EMAIL.INVALID_FORMAT));
			errorFound = true;
		}
		else if (entry.length===0) {
			jsonErrors.push(jsonError("uniEmail", MESSAGES.EMAIL.UNI.NON_UNI_EMAIL));
			errorFound = true;
		} 
		else {
			// Convert array of objects to a single object containing details about the user's university.
			const uniDetails = entry[0];

			// Get the related university from the database.
			// If it doesn't exist: make one for it.
			university = await University.findOne({ domains: uniDetails["domains"] });
			if (!university) {
				university = await University.create({ name:uniDetails["name"], domains:uniDetails["domains"] });
			}
			// We don't include the user in the university users list until they verify their email.
		}
		
		if(!errorFound){
			const user = await User.create({ firstName, lastName, uniEmail:processedEmail, password:hashedPassword, university });

			await handleVerification(uniEmail, user._id);
			await user.populate({path: 'university', model: University});

			res.status(201).json(jsonResponse(user, []));
		}
	}
	catch(err) {
		errorFound = true;
		
		// Convert mongoose errors into a nice format.
		const allErrors = handleFieldErrors(err);
    if(allErrors){
			allErrors.forEach((myErr) => jsonErrors.push(myErr));
		} 
		else {
			jsonErrors.push(jsonError(null, err.message));
		}
	}
	finally {
		if(errorFound){
			res.status(400).json(jsonResponse(null, jsonErrors));
		}
	}
};

// POST /login
module.exports.loginPost = async (req, res) => {
	const { uniEmail, password } = req.body;

	try {
		const user = await User.findOne({ uniEmail });

		if (!user) {
			throw Error(MESSAGES.LOGIN.INVALID_CREDENTIALS);
		}

		// Check input vs hashed, stored password
		const auth = await bcrypt.compare(password, user.password);

		if (!auth) {
			throw Error(MESSAGES.LOGIN.INVALID_CREDENTIALS);
		}

		if (!user.active) {
			throw Error(MESSAGES.LOGIN.INACTIVE_ACCOUNT);
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
			throw Error(MESSAGES.VERIFICATION.MISSING_CODE);
		}

		// Find associated user and make them active.
		const linker = await EmailVerificationCode.findOne({ code });
		if (!linker) {
			throw Error(MESSAGES.VERIFICATION.INVALID_CODE);
		}

		// Add user to their university
		const user = await User.findByIdAndUpdate(linker.userId, { active: true });
		const university = await University.findByIdAndUpdate(user.university, {$push: {users: user}});

		// await university.populate({ path: 'users', model: User});

		await linker.delete();
		res.status(200).send(MESSAGES.VERIFICATION.SUCCESS_RESPONSE_WHOLE_BODY);
	}
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

module.exports.meGet = async (req, res) => {
	res.status(200).json(jsonResponse(req.user, []));
};
