const Chance = require("chance");
const userConstants = require("./userConstants");
const Pact = require("../../models/Pact");
const User = require("../../models/User");
const Post = require("../../models/Post");

const chance = new Chance(1234);

async function seedPosts(university) {
	const pacts = await Pact.find({university : university})
	await populatePacts(pacts);
	console.log(`Finished seeding posts`);
}

async function populatePacts(pacts) {
	for (let i = 0; i < pacts.length; i++) {
		await generateRandomPosts(pacts[i], 20);
	}
}
// 

async function generateRandomPosts(pact, numberOfPosts) {

	const generators = [generateRandomTextPost, generateRandomImagePost]

	for (let i = 0; i < numberOfPosts; i++) {
		const randomGenerator = generators[chance.integer({ min: 0, max: generators.length-1 })];
		await randomGenerator(pact);
	}
}

async function generateRandomTextPost(pact) {
	await createPost(pact, getRandomAuthor(pact), chance.sentence({ words: 2 }), {text : chance.sentence({ words: 30 })});
}

async function generateRandomImagePost(pact) {
	const title = chance.sentence({ words: 2 });
	await createPost(pact, getRandomAuthor(pact), title, {  type: "image", image : getImageLink(title)});
}

async function generateRandomLinkPost(pact) {
	// not implemented
}

async function createPost(pact, author, title, options={type:"text", image:"", text:"", link:""}) {
	const {type, image, text, link} = options;
	const post = await Post.create({
		pact: pact,
		author: author,
		title: title,
		image: image,
		text: text,
		link: link,
		type: type,
	});
	pact.posts.push(post);
	await pact.save();
	return post;
}

function getRandomAuthor(pact) {
	return pact.members[chance.integer({ min: 0, max: pact.members.length-1 })];
}

function getImageLink(title) {
	return `https://source.unsplash.com/random/${title}`;
}

module.exports.seedPosts = seedPosts;
