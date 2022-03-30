const University = require("../models/University");
const { seedPacts } = require("./helpers/pactHelpers");
const { seedUsers } = require("./helpers/userHelpers");
const { seedPosts } = require("./helpers/postHelpers") 

// The number of users to be seeded
const USER_COUNT = 80;

/**
 * Seed the database by creating fake users, pacts, and posts/comments
 */
async function seed() {
	const university = await University.create({name : "King's College London, University of London", domains: ["kcl.ac.uk"]});
	await seedUsers(university, USER_COUNT);
	await seedPacts(university);
	await seedPosts(university);
	console.log("Finished seeding");
}

module.exports.seed = seed;