const User = require("../models/User");
const FriendRequest = require('../models/FriendRequest');
const EmailVerificationCode = require("../models/EmailVerificationCode");
const { handleVerification } = require("../helpers/emailHandlers");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");
const ApiCache = require("../helpers/ApiCache");
const University = require("../models/University");
const { MESSAGES } = require("../helpers/messages");
const {passwordValidators} = require('../helpers/customSignupValidators');
const { isEmail } = require('validator');
const handleFieldErrors = require('../helpers/errorHandler');

// Magic numbers
const COOKIE_MAX_AGE = 432000; // 432000 = 5 days
const SALT_ROUNDS = 10;
const PRIVATE_KEY = "kekw";

/**
 * Helper method to generate JWT
 * @param {ObjectId} - The id of the user
 * @returns The JWT
 */
const createToken = (id) => {
	return jwt.sign({ id }, PRIVATE_KEY, {
		expiresIn: COOKIE_MAX_AGE,
	});
};
module.exports.createToken = createToken;

/**
 * Creates a new user using data provided in the request.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
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
		jsonErrors = handleFieldErrors(err);
	}
	finally {
		if(errorFound){
			res.status(400).json(jsonResponse(null, jsonErrors));
		}
	}
};

/**
 * Logs in a user if the credentials provided are correct.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @throws {Error} If the credentials are invalid, or the user is inactive.
 * @async
 */
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
		await user.populate({path: 'university', model: University});
    await user.populate({path: 'sentRequests', model: FriendRequest});
    await user.populate({path: 'receivedRequests', model: FriendRequest});
		res.status(200).json(jsonResponse({ user }, []));
	} 
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

/**
 * Logs out a logged in user.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.logoutGet = async (req, res) => {
	res.cookie("jwt", "", { maxAge: 1 });
	res.status(200).json(jsonResponse(null, []));
};

/**
 * Verifies a user and adds them to their university (most likely when 
 * they click on the link sent to them when creating an account).
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @throws {Error} If the verification code is invalid or missing.
 * @async
 */
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
		await University.findByIdAndUpdate(user.university, {$push: {users: user}});

		await linker.delete();
		res.status(200).send(MESSAGES.VERIFICATION.SUCCESS_RESPONSE_WHOLE_BODY);
	}
  catch (err) {
		res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
	}
};

/**
 * Returns information about the user who made the request.
 * @param {Request} req - The request
 * @param {Response} res - The response to the request
 * @async
 */
module.exports.meGet = async (req, res) => {
	res.status(200).json(jsonResponse(req.user, []));
};
