const Chance = require("chance");
const { randQuote } = require("@ngneat/falso");
const userConstants = require("./userConstants");
const Pact = require("../../models/Pact");
const User = require("../../models/User");
const {createNotification} = require("./notificationHelpers");

const chance = new Chance(1234);

/**
 * Seed pacts for a given university. Pacts for various categories will created
 * as well as the PactoPact which is used to show some features as a demo
 * 
 * @param university - University to seed pacts in 
 */
async function seedPacts(university) {
	await seedCourses(university);
	await seedModules(university);
	await seedHobbies(university);
	await seedPactoPact(university);

	console.log(`Finished seeding pacts`);
}

/**
 * Creat a fake Pact to showcase specific features such as 
 * moderators and banned users
 * 
 * @param university - University to add the PactoPact to
 */
async function seedPactoPact(university){
	const pactoPact = await createPact
	("PactoPact", "other", "Pacto pact", university, "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1265&q=80");
	await addUsersToPact([], pactoPact) // add default user

	const randomUsers = await getRandomUsers(30, false)

	// Get 4 users to give moderator role to
	const pactToPactModerators = randomUsers.splice(0, 4);
	
	// Get 10 users to ban from pact
	const bannedUsers = randomUsers.splice(0, 10);

	// Add banned users
	await addBannedUsersToPact(bannedUsers, pactoPact);

	// Add moderators
	await addUsersToPact(pactToPactModerators, pactoPact, true)

	// Add users
	await addUsersToPact(randomUsers, pactoPact);
}

/**
 * Seed course related pacts for a university
 * 
 * @param university - University to seed course pacts in 
 */
async function seedCourses(university) {
	for (let i = 0; i < userConstants.COURSES.length; i++) {
		const course = userConstants.COURSES[i];
		const name = course.name;
		const image = course.icon;
		const pact = await createPact(name, "course", randQuote().substring(0,100), university, image);
		const users = await User.find({ course: name });
		if (users.length > 8) {
			const bannedUsers = users.splice(1, 3);
			await addBannedUsersToPact(bannedUsers, pact);
		}
		await addUsersToPact(users, pact);
	}
}

/**
 * Seed module related pacts for a university
 * 
 * @param university - University to seed module pacts in 
 */
async function seedModules(university) {
	const modules = getRandomModuleCodes(userConstants.COURSES.length);

	for (let i = 0; i < modules.length; i++) {
		const pact = await createPact(`${modules[i]}`, "module", randQuote().substring(0,100), university);
		const users = await getRandomUsers(4);
		await addUsersToPact(users, pact);
	}
}

/**
 * Seed hobby related pacts for a university
 * 
 * @param university - University to seed hobby pacts in 
 */
async function seedHobbies(university) {
	for (let i = 0; i < userConstants.HOBBIES.length; i++) {
		const hobby = userConstants.HOBBIES[i];
		const name = hobby.name;
		const image = hobby.icon;
		const possibleCategories = ["society", "other"];
		const chosenCategory = possibleCategories[chance.integer({ min: 0, max: possibleCategories.length-1 })];
		const pact = await createPact(name, chosenCategory, randQuote().substring(0,100), university, image);
		const users = await User.find({ hobbies: name });
		if (users.length > 8) {
			const bannedUsers = users.splice(1, 3);
			await addBannedUsersToPact(bannedUsers, pact);
		}
		await addUsersToPact(users, pact);
	}
}

/**
 * Create a new pact 
 * 
 * @param name - name for the pact to be created
 * @param category - category the pact belongs to
 * @param description - description for the pact
 * @param university - university the pact needs to be created in
 * @param image - image URL for pact to be created
 * @returns new pact with given name, category, description, university and image
 */
async function createPact(name, category, description, university, image) {
	const pact = await Pact.create({
		name,
		category,
		description,
		university: university,
		image: image,
	});

	university.pacts.push(pact);
	await university.save();
	return pact;
}

/**
 * Add a given list of users as members to a given pact
 * 
 * @param users - list of users to be added to pact
 * @param pact - pact that users need to be added to
 * @param isModerator 
 */
async function addUsersToPact(users, pact, isModerator = false) {
	if(users.length > 0) {
		await addUserToPact(users[0], pact, true);
		for(let i = 1; i < users.length; i ++) {
			await addUserToPact(users[i], pact, isModerator);
		}	
	} else {
		// Add the preprogrammed user 'Pac To' to the pact if no other users are added
		const preprogrammedUser = await User.findOne({uniEmail : `pac.to@kcl.ac.uk`});
		await addUserToPact(preprogrammedUser, pact, true);
	}
}

/**
 * Add a user to a pact as member, or moderator
 * 
 * @param user - user to add to the pact
 * @param pact - pact to add the user to
 * @param moderator - wether or not a user should be added as moderator
 */
async function addUserToPact(user, pact, moderator=false) {
	pact.members.push(user);
	user.pacts.push(pact);

	if(moderator) {
		pact.moderators.push(user);
	}

	await user.save();
	await pact.save();
}

/**
 * Add a list of users to the list of banned members of a pact
 * 
 * @param users - user to ban from a pact
 * @param pact - pact to ban the user from
 */
async function addBannedUsersToPact(users, pact) {
	if(users.length > 0) {
		for(let i = 0; i < users.length; i ++) {
			await addBannedUserToPact(users[i], pact);
			await createNotification(users[i], `You have been banned from ${pact.name}`)
		}
	}
}

/**
 * Add a user as a banned member to a pact
 * @param user - the user to ban from the pact
 * @param pact - the pact to ban the user from
 */
async function addBannedUserToPact(user, pact) {
	pact.bannedUsers.push(user);
	await pact.save();
}

/**
 * Return a given number random seeded users from the database
 * 
 * @param numberOfUsers - number of random users to return
 * @param includeDefault - include the defualt 'Pac To' user if True
 * @returns a list of seeded users
 */
async function getRandomUsers(numberOfUsers, includeDefault= true) {
	let users;
	if(includeDefault){
		users = await User.find({}); //random users but default user
	}
	else{
		users = await User.find({uniEmail: {$ne: "pac.to@kcl.ac.uk"}}); //random users but default user
	}

	const shuffledUsers = users.sort(() => chance.integer() - chance.integer()).slice(0, numberOfUsers);
	return shuffledUsers;
}

/**
 * Generate a list of random module codes
 * 
 * @param amount - number of module codes to generate
 * @returns a list of random module codes
 */
function getRandomModuleCodes(amount) {
	const modules = [];
	
	for (let i = 0; i < amount; i++) {
		modules.push(getRandomModuleCode());
	}

	return modules;
}

/**
 * Generate a random module code
 * 
 * @returns a random module code
 */
function getRandomModuleCode() {
	return ( "" + chance.integer({ min: 4, max: 7 }) +
		chance.string({ length: 3, alpha:true, casing: "upper" }) +
		chance.integer({ min: 0, max: 9 }) +
		chance.string({ length: 3, alpha:true, casing: "upper" })
	);
}

module.exports.seedPacts = seedPacts;
