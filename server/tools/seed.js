const Chance = require("chance");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const USER_COUNT = 20;

const chance = new Chance();
const SALT_ROUNDS = 10;

dotenv.config();

async function createUser(firstName, lastName) {
	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash("Password123", salt);
	await User.create({
		firstName,
		lastName,
		uniEmail: `${firstName}.${lastName}@kcl.ac.uk`,
		password: hashedPassword,
	});
}

async function seedUsers() {
	for (let i = 0; i <= USER_COUNT; i++) {
		let name = chance.name();
		await createUser(name.split(" ")[0], name.split(" ")[0]);
	}
	console.log(`Finished seeding ${USER_COUNT} users`);
}

async function seed() {
	await seedUsers();
	console.log("Finished seeding");
	process.exit();
}

mongoose.connect(process.env.DB_CONNECTION_URL, () => {
	console.log("Connected to the database!");
	seed();
});
