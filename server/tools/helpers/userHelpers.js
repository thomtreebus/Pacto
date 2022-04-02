const Chance = require("chance");
const bcrypt = require("bcrypt");
const userConstants = require("./userConstants");
const User = require("../../models/User");
const FriendRequest = require("../../models/FriendRequest");
const chance = new Chance(1234);
const SALT_ROUNDS = 10;
const { createNotification } = require("./notificationHelpers");

/**
 * Seed a given number of users for a university
 * 
 * @param university - university the user is part of 
 * @param USER_COUNT - number of users to seed 
 */
async function seedUsers(university, USER_COUNT) {
	const names = chance.unique(chance.name, USER_COUNT);

	for (let i = 0; i < names.length; i++) {
		await createUser(names[i].split(" ")[0], names[i].split(" ")[1], university);
	}
	// Seed the special 'Pac To' user used to view certain features as a demo
	await seedPacToUser(university);
	await generateFriends();
	console.log(`Finished seeding ${USER_COUNT} users`);
}

/**
 * Seed a special user named 'Pac To' that can be used by people to view certain features
 * of the application such as notifications
 * @param university - University to add the 'Pac To' user to
 */
async function seedPacToUser(university) {
	await createUser("Pac", "To", university);
	const user = await User.findOne({ firstName: "Pac" });
	// Seed notifications for the user used to view the application
	await createNotification(user, "Welcome to Pacto!");
	await createNotification(user, "Your post received a new comment!");
	await createNotification(user, "You have an incoming friend request");
	await createNotification(user, "Jane Doe has accepted your friend request");
	await createNotification(user, "You have been promoted to moderator in the PactoPact");
	await createNotification(user, "You are no longer banned from the Bird Watching pact");
};

/**
 * Creat a new user
 * 
 * @param firstName - user's first name
 * @param lastName - user's last name
 * @param university - University a user attends
 */
async function createUser(firstName, lastName, university) {
	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash("Password123", salt);

	const course = getRandomCourse();
	const location = getRandomLocation();
	const hobbies = getRandomHobbies();

	const user = await User.create({
		firstName,
		lastName,
		uniEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@kcl.ac.uk`,
		password: hashedPassword,
		active: true,
		university: university,
		course: course,
		location: location,
		image: getRandomImage(firstName, lastName),
		bio: `Hi! My name is ${firstName} ${lastName}. I'm from ${location} and I'm currently studying ${course} at ${university.name}. I'm really into ${hobbies[0]} and have recently started to become interested in ${hobbies[1]} as well! Feel free to send me a friend request or follow me on one of my other social media accounts.`,
		hobbies: hobbies,
		friends: [],
		instagram: `${firstName}.${lastName}`,
		linkedin: `${firstName} ${lastName}`,
		phone: chance.phone({ country: 'uk', mobile: true })
	});

	university.users.push(user);
	await university.save();
}

/**
 * Use Dicebar Avatars to generate an avatar image for a user
 * @param firstName - user's first name
 * @param lastName - user's last name
 * @returns the random avatar image
 */
function getRandomImage(firstName, lastName) {
	const image = `https://avatars.dicebear.com/api/personas/${firstName.toLowerCase()}${lastName.toLowerCase()}.svg`;
	return image;
}

/**
 * Return a random course that a user can study
 * 
 * @returns a course from the list of courses in userConstants.js
 */
function getRandomCourse() {
	const course = userConstants.COURSES[chance.integer({ min: 0, max: userConstants.COURSES.length - 1 })];
	return course.name;
}

/**
 * Return a random location a user is from
 * 
 * @returns a location from the list of locations in userConstants.js
 */
function getRandomLocation() {
	return userConstants.CITIES[chance.integer({ min: 0, max: userConstants.CITIES.length-1 })]
}

/**
 * Return 2 random hobbies a user has
 * 
 * @returns hobbies from the list of hobbies in userConstants.js
 */
function getRandomHobbies() {
	const hobbies = []; 
	const randomHobby = () => chance.integer({ min: 0, max: userConstants.HOBBIES.length-1 })
	chance.unique(randomHobby, 2).forEach(hobby => hobbies.push(userConstants.HOBBIES[hobby].name));
	return hobbies;
}

/**
 * Generate a list of friends for each seeded user
 */
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

/**
 * Add two given users to each other's list of friends
 * 
 * @param user1 - first user
 * @param user2 - second user
 */
async function generateFriend(user1, user2) {
	user1.friends.push(user2);
	user2.friends.push(user1);
	await user1.save();
	await user2.save();
}

/**
 * Generate a friend request from one user to another.
 * The person requesting and the person receiving the request is randomized
 * 
 * @param user1 - first user
 * @param user2 - second user
 */
async function generateFriendRequest(user1, user2) {
	const shuffledUsers = [user1, user2].sort(() => chance.integer() - chance.integer());
	// Creat a new friend request and randomly choose which user is requestor and recipient
	const request = await FriendRequest.create({requestor : shuffledUsers[0], recipient : shuffledUsers[1]})
	shuffledUsers[0].sentRequests.push(request);
	shuffledUsers[1].receivedRequests.push(request);

	// Notify the recipient that they have received a new friend request
	await createNotification(shuffledUsers[1], `${shuffledUsers[0].firstName} ${shuffledUsers[0].lastName} has sent you a friend request`)
	await shuffledUsers[0].save();
	await shuffledUsers[1].save();
}

/**
 * Return true if two given users aren't already friends and neither of them have
 * sent each other a friend request
 * 
 * @param user1 - first user
 * @param user2 - second user
 */
function canGenerateFriendship(user1, user2) {
	return !areUsersFriends(user1, user2) && !doUsersHavePendingRequest(user1, user2);
}

/**
 * Return true if users are already friends with each other
 * 
 * @param user1 - first user
 * @param user2 - second user
 * @returns true if users are friends
 */
function areUsersFriends(user1, user2) {
	return isFriendOf(user1, user2) || isFriendOf(user2, user1)
}

/**
 * Return true if the second given user is a friend of the first given user
 * @param user1 - first user
 * @param user2 - user to check if friend of first user
 * @returns true if user2 is friend of user 1
 */
function isFriendOf(user1, user2) {
	return user1.friends.includes(user2._id);
}

/**
 * Return true if either users have a pending request from each other
 * 
 * @param user1 - first user
 * @param user2 - second user
 * @returns true if either user has pending request from the other one
 */
function doUsersHavePendingRequest(user1, user2) {
	return hasPendingRequestFrom(user1, user2) || hasPendingRequestFrom(user2, user1);
}

/**
 * Return true if a given user has sent a friend request to another user 
 * 
 * @param user1 - user to check if they sent friend request to user2
 * @param user2 - user2
 * @returns true if user1 has sent a friend request to user2
 */
function hasPendingRequestFrom(user1, user2) {
	return user1.sentRequests.filter((request) => user2.receivedRequests.includes(request)).length > 0;
}

module.exports.seedUsers = seedUsers;
