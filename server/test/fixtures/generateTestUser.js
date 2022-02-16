const University = require("../../models/University");
const User = require("../../models/User");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;
const USER_EMAIL = "pac.to@kcl.ac.uk";
module.exports.generateTestUser = async () => {
  // Dummy uni
	const uni = await University.create( { name: "kcl", domains: ["kcl.ac.uk"] });

	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash("Password123", salt);

	const user = await User.create({
		firstName: "pac",
		lastName: "to",
		uniEmail: USER_EMAIL,
		password: hashedPassword,
		university: uni
	});

	await uni.users.push(user);
	await uni.save();
	return user;
};

module.exports.getEmail = () => {return USER_EMAIL;}

// Must be used after generateTestUser has been called!!
module.exports.generateNextTestUser = async (name) => {
  // Dummy uni
	const uni = await University.findOne( { name: "kcl", domains: ["kcl.ac.uk"] });

	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash("Password123", salt);

	const customEmail = name + ".to@kcl.ac.uk";

	const user = await User.create({
		firstName: name,
		lastName: "to",
		uniEmail: customEmail,
		password: hashedPassword,
		university: uni
	});

	await uni.users.push(user);
	await uni.save();
	return user;
};