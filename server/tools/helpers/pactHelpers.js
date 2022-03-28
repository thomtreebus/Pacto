const Chance = require("chance");
const { randQuote } = require("@ngneat/falso");
const userConstants = require("./userConstants");
const Pact = require("../../models/Pact");
const User = require("../../models/User");

const chance = new Chance(1234);

async function seedPacts(university) {
	await seedCourses(university);
	await seedModules(university);
	await seedHobbies(university);
	await seedPactoPact(university);

	console.log(`Finished seeding pacts`);
}

async function seedPactoPact(university){
	const pactoPact = await createPact
	("PactoPact", "other", "Pacto pact", university, "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1265&q=80");
	await addUsersToPact([], pactoPact) // add default user

	const randomUsers = await getRandomUsers(50,false)
	const pactToPactModerators = randomUsers.splice(0,4);
	const bannedUsers = randomUsers.splice(0, 10);

	// Add banned users
	await addBannedUsersToPact(bannedUsers, pactoPact);

	// Add moderators
	await addUsersToPact(pactToPactModerators, pactoPact, true)

	// Add users
	await addUsersToPact(randomUsers, pactoPact);
}

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

async function seedModules(university) {
	const modules = getRandomModuleCodes(userConstants.COURSES.length);

	for (let i = 0; i < modules.length; i++) {
		const pact = await createPact(`${modules[i]}`, "module", randQuote().substring(0,100), university);
		const users = await getRandomUsers(4);
		await addUsersToPact(users, pact);
	}
}

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

async function addUsersToPact(users, pact, isModerator = false) {
	if(users.length > 0) {
		await addUserToPact(users[0], pact, true);
		for(let i = 1; i < users.length; i ++) {
			await addUserToPact(users[i], pact, isModerator);
		}	
	} else {
		const preprogrammedUser = await User.findOne({uniEmail : `pac.to@kcl.ac.uk`});
		await addUserToPact(preprogrammedUser, pact, true);
	}
}

async function addUserToPact(user, pact, moderator=false) {
	pact.members.push(user);
	user.pacts.push(pact);

	if(moderator) {
		pact.moderators.push(user);
	}

	await user.save();
	await pact.save();
}

async function addBannedUsersToPact(users, pact) {
	if(users.length > 0) {
		for(let i = 0; i < users.length; i ++) {
			await addBannedUserToPact(users[i], pact);
		}
	}
}

async function addBannedUserToPact(user, pact) {
	pact.bannedUsers.push(user);
	await pact.save();
}

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
 
function getRandomModuleCodes(amount) {
	const modules = [];
	
	for (let i = 0; i < amount; i++) {
		modules.push(getRandomModuleCode());
	}

	return modules;
}

function getRandomModuleCode() {
	return ( "" + chance.integer({ min: 4, max: 7 }) +
		chance.string({ length: 3, alpha:true, casing: "upper" }) +
		chance.integer({ min: 0, max: 9 }) +
		chance.string({ length: 3, alpha:true, casing: "upper" })
	);
}

module.exports.seedPacts = seedPacts;
