const University = require("../models/University");
const { seedPacts } = require("./helpers/pactHelpers");
const { seedUsers } = require('./helpers/userHelpers');

const USER_COUNT = 20;

async function seed() {
	const university = await University.create({name : "King's College London, University of London", domains: ["kcl.ac.uk"]});
	await seedUsers(university, USER_COUNT);
	await seedPacts(university);
	console.log("Finished seeding");
}

module.exports.seed = seed;