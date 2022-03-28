const Chance = require("chance");
const bcrypt = require("bcrypt");
const userConstants = require("./userConstants");
const User = require("../../models/User");
const FriendRequest = require("../../models/FriendRequest");
const chance = new Chance(1234);
const SALT_ROUNDS = 10;

async function seedUsers(university, USER_COUNT) {
	const names = chance.unique(chance.name, USER_COUNT);

	for (let i = 0; i < names.length; i++) {
		await createUser(names[i].split(" ")[0], names[i].split(" ")[1], university);
	}

	await createUser("Pac", "To", university);
	await generateFriends();
	console.log(`Finished seeding ${USER_COUNT} users`);
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
		course: getRandomCourse(),
		location: getRandomLocation(),
		image: getRandomImage(firstName, lastName),
		bio: chance.paragraph(),
		hobbies: getRandomHobbies(),
		friends: [],
		instagram: `${firstName}.${lastName}`,
		linkedin: `${firstName}.${lastName}`,
		phone: chance.phone({ country: 'uk', mobile: true })
	});

	university.users.push(user);
	await university.save();
}

function getRandomImage(firstName, lastName) {
	return `https://avatars.dicebear.com/api/personas/${firstName.toLowerCase()}${lastName.toLowerCase()}.svg`;
}

function getRandomCourse() {
	const course = userConstants.COURSES[chance.integer({ min: 0, max: userConstants.COURSES.length - 1 })];
	return course.name;
}

function getRandomLocation() {
	return userConstants.CITIES[chance.integer({ min: 0, max: userConstants.CITIES.length-1 })]
}

function getRandomHobbies() {
	const hobbies = []; 
	randomHobby = () => chance.integer({ min: 0, max: userConstants.HOBBIES.length-1 })
	chance.unique(randomHobby, 2).forEach(hobby => hobbies.push(userConstants.HOBBIES[hobby].name));
	return hobbies;
}

async function generateFriends() {
	const users = await User.find({});
	for (let i = 0; i < users.length; i++) {
		for (let j = 0; j < users.length; j++) {
			if(i !== j && canGenerateFriendship(users[i], users[j])) {
				const randomNumber = chance.integer({ min: 1, max: 10 });
				if(randomNumber < 4) {
					const friendshipGenerators = [generateFriend, generateFriendRequest];
					const friendshipGenerator = friendshipGenerators[chance.integer({ min: 0, max: friendshipGenerators.length - 1 })];
					await friendshipGenerator(users[i], users[j]);
				}
			}
		}
	}
}

async function generateFriend(user1, user2) {
	user1.friends.push(user2);
	user2.friends.push(user1);
	await user1.save();
	await user2.save();
}

async function generateFriendRequest(user1, user2) {
	const shuffledUsers = [user1, user2].sort(() => chance.integer() - chance.integer());
	const request = await FriendRequest.create({requestor : shuffledUsers[0], recipient : shuffledUsers[1]})
	shuffledUsers[0].sentRequests.push(request);
	shuffledUsers[1].receivedRequests.push(request);
	await shuffledUsers[0].save();
	await shuffledUsers[1].save();
}

function canGenerateFriendship(user1, user2) {
	return !areUsersFriends(user1, user2) && !doUsershavePendingRequest(user1, user2);
}

function areUsersFriends(user1, user2) {
	return isFriendOf(user1, user2) || isFriendOf(user2, user1)
}

function isFriendOf(user1, user2) {
	return user1.friends.includes(user2._id);
}

function doUsershavePendingRequest(user1, user2) {
	return hasPendingRequestFrom(user1, user2) || hasPendingRequestFrom(user2, user1);
}

function hasPendingRequestFrom(user1, user2) {
	return user1.sentRequests.filter((request) => user2.receivedRequests.includes(request)).length > 0;
}

module.exports.seedUsers = seedUsers;
