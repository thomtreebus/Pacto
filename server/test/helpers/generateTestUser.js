const University = require("../models/University");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const generateTestUser = async () => {
  // Dummy uni
	const uni = await University.create( { name: "kcl", domains: ["kcl.ac.uk"] });

	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash("Password123", salt);

	const user = await User.create({
		firstName: "pac",
		lastName: "to",
		uniEmail: "pac.to@kcl.ac.uk",
		password: hashedPassword,
		university: uni
	});

	await uni.users.push(user);
	await uni.save();
	return user;
};