const Chance = require("chance");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const University = require("../models/University");
const bcrypt = require("bcrypt");

const USER_COUNT = 20;

const chance = new Chance();
const SALT_ROUNDS = 10;

dotenv.config();

async function createUser(firstName, lastName, university) {
	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash("Password123", salt);
	await User.create({
		firstName,
		lastName,
		uniEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@kcl.ac.uk`,
		password: hashedPassword,
		active: true,
		university: university._id,
	});
}

async function seedUsers() {
	await createUser("pac", "to");
	for (let i = 0; i <= USER_COUNT; i++) {
		let name = chance.name();
		await createUser(name.split(" ")[0], name.split(" ")[0], university);
	}
	console.log(`Finished seeding ${USER_COUNT} users`);
}

async function seed() {
	const university = await University.create({ name: "King's College London", domains: ["@kcl.ac.uk"] });
	consolg.log(university);
	await seedUsers(university);
	console.log("Finished seeding");
	process.exit();
}

mongoose.connect(process.env.DB_CONNECTION_URL, () => {
	console.log("Connected to the database!");
	seed();
});
