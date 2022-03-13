const Chance = require("chance");
const userConstants = require("./userConstants");
const Pact = require("../../models/Pact");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");


const chance = new Chance(1234);

async function seedPosts(university) {
	const pacts = await Pact.find({university : university})
	await populatePacts(pacts);
	console.log(`Finished seeding posts and comments`);
}

async function populatePacts(pacts) {
	for (let i = 0; i < pacts.length; i++) {
		await generateRandomPosts(pacts[i], 20);
		const posts = await Post.find({ pact: pacts[i] });
		await populatePosts(pacts[i], posts);
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

async function populatePosts(pact, posts) {
	for (let i = 0; i < posts.length; i++) {
		await generateRandomComments(pact, posts[i], chance.integer({ min: 0, max: 3 }));
	}
}

async function generateRandomComments(pact, post, numberOfComments) {
	for (let i = 0; i < numberOfComments; i++) {
		const comment = await createRandomComment(pact, post);
		await populateVotes(comment, pact);
	}
}

async function createRandomComment(pact, post) {
	const comment = await createComment(post, getRandomAuthor(pact), chance.sentence({ words: 15 }));
	return comment;
}

async function createComment(post, author, text, options={parentComment: undefined}) {
	const {parentComment} = options;
	const comment = await Comment.create({
		author: author,
		text: text,
		parentComment: parentComment,
	});
	post.comments.push(comment);
	await post.save();
	return comment;
}

function getRandomAuthor(pact) {
	return pact.members[chance.integer({ min: 0, max: pact.members.length-1 })];
}

async function populateVotes(obj, pact) {
	const { members } = pact;
	
	const voteOptions = [populateUpvote, populateDownvote, async (obj, member) => {}]
	
	for (let i = 0; i < members.length; i++) {
		const member = members[i];
		const voteFunction = voteOptions[chance.integer({ min: 0, max: voteOptions.length-1 })];
		await voteFunction(obj, member);
	}
}

async function populateUpvote(obj, member) {
	obj.upvoters.push(member);
	obj.votes = obj.votes + 1;
	await obj.save();
}

async function populateDownvote(obj, member) {
	obj.downvoters.push(member);
	obj.votes = obj.votes - 1;
	await obj.save();
}

function getImageLink(title) {
	return `https://source.unsplash.com/random/${title}`;
}

module.exports.seedPosts = seedPosts;
