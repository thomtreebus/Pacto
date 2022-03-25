const User = require("../models/User");
const Pact = require("../models/Pact");
const Comment = require("../models/Comment");
const University = require("../models/University");
const Post = require("../models/Post");
const EmailVerificationCode = require("../models/EmailVerificationCode");
const FriendRequest = require("../models/FriendRequest");

async function unseed() {
	await User.deleteMany({});
	await Pact.deleteMany({});
	await University.deleteMany({});
	await Post.deleteMany({});
	await Comment.deleteMany({});
	await EmailVerificationCode.deleteMany({});
	await FriendRequest.deleteMany({});
	console.log("Finished unseeding");
}

module.exports.unseed = unseed;