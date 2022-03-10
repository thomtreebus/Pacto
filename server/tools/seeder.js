const University = require("../models/University");
const { seedUsers } = require('./helpers/userHelpers');

const USER_COUNT = 20;
// const PACT_COUNT = 10;
// const PACT_CATEGORIES = ["society", "course", "module", "other"]


async function seed() {
	const university = await University.create({name : "King's College London, University of London", domains: ["kcl.ac.uk"]});
	await seedUsers(university, USER_COUNT);
	console.log("Finished seeding");
}

module.exports.seed = seed;