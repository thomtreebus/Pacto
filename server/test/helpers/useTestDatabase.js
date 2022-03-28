const User = require("../../models/User");
const Pact = require("../../models/Pact");
const Comment = require("../../models/Comment");
const University = require("../../models/University");
const Post = require("../../models/Post");
const EmailVerificationCode = require("../../models/EmailVerificationCode");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const FriendRequest = require("../../models/FriendRequest");
const Notification = require("../../models/Notification");
const Link = require("../../models/Link");

dotenv.config();

function useTestDatabase(key = "") {
	beforeAll(async () => {
		await mongoose.connect(`${process.env.TEST_DB_CONNECTION_URL}`);
	});

	afterAll(async () => {
		await mongoose.connection.close();
	});

	afterEach(async () => {
		await clearDatabase();
	});

	async function clearDatabase() {
		await User.deleteMany({});
		await Pact.deleteMany({});
		await University.deleteMany({});
		await Post.deleteMany({});
		await Comment.deleteMany({});
		await EmailVerificationCode.deleteMany({});
		await FriendRequest.deleteMany({});
		await Notification.deleteMany({});
		await Link.deleteMany({});
	}
}

module.exports = useTestDatabase;
