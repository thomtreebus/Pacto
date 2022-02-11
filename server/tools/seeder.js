const Chance = require("chance");
const User = require("../models/User");
const University = require("../models/University");
const bcrypt = require("bcrypt");
const Pact = require("../models/Pact");

const USER_COUNT = 20;
const PACT_COUNT = 10;
const PACT_CATEGORIES = ["society", "course", "module", "other"]

const CITIES = ["London", "Manchester", "Bristol", "Liverpool", "Birmingham", "Edinburgh", "Brighton"];
const COURSES = [
	"Computer Science",
	"Economics",
	"Business Management",
	"Medicine",
	"Geography",
	"Politics",
	"International Relations",
	"Engineering",
	"Physics",
	"Mathematics",
	"Film Studies",
	"History"
]
const IMAGES = [
	"https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man4_hijpf6.jpg",
	"https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man2_rri7yc.jpg",
	"https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man3_xkuekk.jpg",
	"https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/girl3_y2a4jv.jpg",
	"https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/girl1_fpuf8f.jpg",
	"https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man1_qexxnb.jpg",
	"https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/girl2_g0yzaw.jpg",
]

const chance = new Chance();
const SALT_ROUNDS = 10;

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


async function createUser(firstName, lastName, university) {
	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash("Password123", salt);
	const user = await User.create({
		firstName,
		lastName,
		uniEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@kcl.ac.uk`,
		password: hashedPassword,
		active: true,
		university: university,
		course: COURSES[Math.floor(Math.random() * COURSES.length)],
		location: CITIES[Math.floor(Math.random() * CITIES.length)],
		image: IMAGES[Math.floor(Math.random() * IMAGES.length)],
		bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi bibendum varius orci, nec scelerisque magna tempor ut. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras a felis in nunc tincidunt rhoncus. Sed ut ante blandit lorem accumsan accumsan at eget ex. Phasellus aliquet eros massa, non malesuada orci feugiat quis. Duis at pulvinar dui. Pellentesque vestibulum erat arcu. Nunc ac sem sodales arcu ullamcorper commodo.",
		hobbies : ["Studying", "Video Games", "Football"]
	});

	university.users.push(user);
	await university.save();
}

async function seedPacts(university) {
	const names = chance.unique(chance.company, PACT_COUNT);

	for (let i = 0; i < names.length; i++) {
		const category = PACT_CATEGORIES[chance.integer({min: 0, max: PACT_CATEGORIES.length - 1})];
		await createPact(names[i], category, chance.sentence(), university);
	}

	console.log(`Finished seeding ${PACT_COUNT} pacts`);
}

async function seedUsers(university) {
	const names = chance.unique(chance.name, USER_COUNT);

	for (let i = 0; i < names.length; i++) {
		await createUser(names[i].split(" ")[0], names[i].split(" ")[1], university);
	}

	await createUser("pac", "to", university);
	console.log(`Finished seeding ${USER_COUNT} users`);
}

async function addUserToPact(user, pact) {
	pact.members.push(user);

	if(chance.integer({min: 0, max: 1})) {
		pact.moderators.push(user);
	}

	await pact.save();
}

async function populatePacts() {
	const users = await User.find({});
	const pacts = await Pact.find({});

	for (let i = 0; i < users.length; i++) {
		for (let j = 0; j < pacts.length; j++) {
			await addUserToPact(users[i], pacts[j]);
		}
	}
}

async function seed() {
	const university = await University.create({name : "King's College London", domains: ["@kcl.ac.uk"]});
	await seedPacts(university);
	await seedUsers(university);
	await populatePacts();
	console.log("Finished seeding");
}

module.exports.seed = seed;