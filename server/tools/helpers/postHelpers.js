const Chance = require("chance");
const { randQuote, randParagraph } = require("@ngneat/falso");
const Pact = require("../../models/Pact");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const { LINKS } = require("./postConstants");
const {createNotification} = require("./notificationHelpers");


const chance = new Chance(1234);

async function seedPosts(university) {
	const pacts = await Pact.find({university : university})
	await populatePacts(pacts);
	console.log(`Finished seeding posts and comments`);
}

async function populatePacts(pacts) {
	// Generate 20 random posts for each pact
	for (let i = 0; i < pacts.length; i++) {
		await generateRandomPosts(pacts[i], 20);
		const posts = await Post.find({ pact: pacts[i] });
		await populatePosts(pacts[i], posts);
	}
}

async function generateRandomPosts(pact, numberOfPosts) {

	const generators = [generateRandomTextPost, generateRandomImagePost, generateRandomLinkPost];
	// For each post, randomly pick a post type, either text, image, or link.
	for (let i = 0; i < numberOfPosts; i++) {
		const randomGenerator = generators[chance.integer({ min: 0, max: generators.length-1 })];
		const post =  await randomGenerator(pact);
		await populateVotes(post, pact);
	}
}

async function generateRandomTextPost(pact) {
	// const title = chance.sentence({ words: 2 });
	const title = randQuote().substring(0,200);
	const post  = await createPost(pact, getRandomAuthor(pact), title, {text : randQuote() + " " + randQuote()});
	return post;
}

async function generateRandomImagePost(pact) {
	const title = randQuote().substring(0,200);
	const post = await createPost(pact, getRandomAuthor(pact), title, {  type: "image", image : getImageLink(title)});
	return post;
}

async function generateRandomLinkPost(pact) {
	const title = randQuote().substring(0,200);
	const post = await createPost(pact, getRandomAuthor(pact), title, {  type: "link", link : getRandomLink()});
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

async function populateComment(pact, post, comment) {
	const childComment = await generateRandomComments(pact, post, chance.integer({ min: 0, max: 3 }), {parentComment: comment});
	return childComment;
}

async function generateRandomComments(pact, post, numberOfComments, options={parentComment: undefined}) {
	for (let i = 0; i < numberOfComments; i++) {
		const comment = await createRandomComment(pact, post, options);
		await populateVotes(comment, pact);
		if (!options.parentComment) {
			await populateComment(pact, post, comment);
		}
	}
}

async function createRandomComment(pact, post, options={parentComment: undefined}) {
	const comment = await createComment(post, getRandomAuthor(pact), randQuote().substring(0,150), options);
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

	if(parentComment) {
		parentComment.childComments.push(comment);
		await parentComment.save();
	}
	return comment;
}

function getRandomAuthor(pact) {
	return pact.members[chance.integer({ min: 0, max: pact.members.length-1 })];
}

async function populateVotes(obj, pact) {
	const { members } = pact;
	
	const voteOptions = [populateUpvote, populateDownvote, async (obj, member) => {}]
	// For each member of a pact, either have them upvote or downvote a post
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

function getRandomLink(title) {
	return LINKS[chance.integer({ min: 0, max: LINKS.length-1 })];
}

function getImageLink(title) {
	return `https://source.unsplash.com/random/${title.slice(0, -1)}`;
}

module.exports.seedPosts = seedPosts;
