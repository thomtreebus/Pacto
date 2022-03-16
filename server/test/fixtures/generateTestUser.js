const University = require("../../models/University");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const {getDefaultTestUser} = require("../helpers/defaultTestUser");

const SALT_ROUNDS = 10;

// Returns the default test user email of when generateTestUser is called without parameters.
module.exports.getDefaultTestUserEmail = () => {
	const defaultUser = getDefaultTestUser();
	return defaultUser.uniEmail;
}

// Generates a test user. If not parameters are specified it uses default values.
module.exports.generateTestUser = async (name = "pac") => {
	return generateCustomUniTestUser(name, "kcl");
};

// Generate test user with a specified uni as a uniName String
const generateCustomUniTestUser = async (name, uniName = "kcl") => {
	// Dummy uni
	let uni = await University.findOne( { name: uniName, domains: [`${ uniName }.ac.uk`] });
	if (uni === null) {
		uni = await University.create({name: uniName, domains: [`${uniName}.ac.uk`]});
	}
	const defaultUser = getDefaultTestUser();

	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash(defaultUser.password, salt);

	const customEmail = name.toLowerCase() + `.to@${uniName}.ac.uk`;

	const user = await User.create({
		firstName: name,
		lastName: defaultUser.lastName,
		uniEmail: customEmail,
		password: hashedPassword,
		university: uni,
		course: defaultUser.course,
		bio: defaultUser.bio,
		image: defaultUser.image,
		hobbies: defaultUser.hobbies,
		location: defaultUser.location,
		instagram: defaultUser.instagram,
		linkedin: defaultUser.linkedin,
		phone: defaultUser.phone,
	});

	await uni.users.push(user);
	await uni.save();
	return user;
};

module.exports.generateCustomUniTestUser = generateCustomUniTestUser;