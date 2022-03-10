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
		await createPact(course, "course", chance.sentence(), university);
	}
}

async function seedModules(university) {
	const modules = getRandomModuleCodes(userConstants.COURSES.length);

	for (let i = 0; i < modules.length; i++) {
		await createPact(`${modules[i]}`, "module", chance.sentence(), university);
	}
}

async function seedHobbies(university) {
	for (let i = 0; i < userConstants.HOBBIES.length; i++) {
		const hobby = userConstants.HOBBIES[i];
		const possibleCategories = ["society", "other"];
		const chosenCategory = possibleCategories[chance.integer({ min: 0, max: possibleCategories.length })];
		await createPact(hobby, chosenCategory, chance.sentence(), university);
	}
}

async function createPact(name, category, description, university) {
	const pact = await Pact.create({
		name,
		category,
		description,
		university: university,
	});

	university.pacts.push(pact);
	await university.save();
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

// async function addUserToPact(user, pact) {
// 	pact.members.push(user);
// 	user.pacts.push(pact);

// 	if(chance.integer({min: 0, max: 1})) {
// 		pact.moderators.push(user);
// 	}

// 	await user.save();
// 	await pact.save();
// }

module.exports.seedPacts = seedPacts;
