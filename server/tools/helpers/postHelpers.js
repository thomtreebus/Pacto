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

async function generateRandomPosts(pact, numberOfPosts) {

	const generators = [generateRandomTextPost, generateRandomImagePost, generateRandomLinkPost];

	for (let i = 0; i < numberOfPosts; i++) {
		const randomGenerator = generators[chance.integer({ min: 0, max: generators.length-1 })];
		const post =  await randomGenerator(pact);
		await populateVotes(post, pact);
	}
}

async function generateRandomTextPost(pact) {
	const title = chance.sentence({ words: 2 });
	const post  = await createPost(pact, getRandomAuthor(pact), title, {text : chance.sentence({ words: 30 })});
	return post;
}

async function generateRandomImagePost(pact) {
	const title = chance.sentence({ words: 2 });
	const post = await createPost(pact, getRandomAuthor(pact), title, {  type: "image", image : getImageLink(title)});
	return post;
}

async function generateRandomLinkPost(pact) {
	const title = chance.sentence({ words: 2 });
	const post = await createPost(pact, getRandomAuthor(pact), title, {  type: "link", link : chance.url()});
	return post;
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

async function populateVotes(post, pact) {
	const { members } = pact;
	
	const voteOptions = [populateUpvote, populateDownvote]
	
	for (let i = 0; i < members.length; i++) {
		const member = members[i];
		const voteFunction = voteOptions[chance.integer({ min: 0, max: voteOptions.length-1 })];
		await voteFunction(post, member);
	}
}

async function populateUpvote(post, member) {
	post.upvoters.push(member);
	post.votes = post.votes + 1;
	await post.save();
}

async function populateDownvote(post, member) {
	post.downvoters.push(member);
	post.votes = post.votes - 1;
	await post.save();
}

function getImageLink(title) {
	return `https://source.unsplash.com/random/${title.slice(0, -1)}`;
}

module.exports.seedPosts = seedPosts;
