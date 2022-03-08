const University = require("../../models/University");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const {getDefaultTestUser} = require("../helpers/defaultTestUser");

const SALT_ROUNDS = 10;

module.exports.getDefaultTestUserEmail = () => {
	const defaultUser = getDefaultTestUser();
	return defaultUser.uniEmail;
}

module.exports.generateTestUser = async (name = "pac") => {
	return generateCustomUniTestUser(name, "kcl");
};

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
		university: uni
	});

	await uni.users.push(user);
	await uni.save();
	return user;
};

module.exports.generateCustomUniTestUser = generateCustomUniTestUser;