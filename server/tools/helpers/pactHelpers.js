const Chance = require("chance");
const userConstants = require("./userConstants");
const Pact = require("../../models/Pact");
const User = require("../../models/User");

const chance = new Chance(1234);

async function seedPacts(university) {
	await seedCourses(university);
	await seedModules(university);
	await seedHobbies(university);
	console.log(`Finished seeding pacts`);
}

async function seedCourses(university) {
	for (let i = 0; i < userConstants.COURSES.length; i++) {
		const course = userConstants.COURSES[i];
		const name = course.name;
		const image = course.icon;
		const pact = await createPact(name, "course", chance.sentence(), university, image);
		const users = await User.find({ course: name });
		if (users.length > 8) {
			const bannedUsers = users.splice(0, 2);
			await addBannedUsersToPact(bannedUsers, pact);
		}
		await addUsersToPact(users, pact);
	}
}

async function seedModules(university) {
	const modules = getRandomModuleCodes(userConstants.COURSES.length);

	for (let i = 0; i < modules.length; i++) {
		const pact = await createPact(`${modules[i]}`, "module", chance.sentence(), university);
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
		const pact = await createPact(name, chosenCategory, chance.sentence(), university, image);
		const users = await User.find({ hobbies: name });
		if (users.length > 8) {
			const bannedUsers = users.splice(0, 2);
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

async function addUsersToPact(users, pact) {
	if(users.length > 0) {
		await addUserToPact(users[0], pact, true);
		for(let i = 1; i < users.length; i ++) {
			await addUserToPact(users[i], pact);
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
		for(let i = 1; i < users.length; i ++) {
			await addBannedUserToPact(users[i], pact);
		}
	}
}

async function addBannedUserToPact(user, pact) {
	pact.bannedUsers.push(user);
	await pact.save();
}

async function getRandomUsers(numberOfUsers) {
	const users = await User.find({});
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
