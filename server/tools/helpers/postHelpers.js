const Chance = require("chance");
const { randQuote, randParagraph } = require("@ngneat/falso");
const Pact = require("../../models/Pact");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const { LINKS } = require("./postConstants");

const chance = new Chance(1234);

/**
 * Seed posts for a given university
 * 
 * @param university - university to seed posts in
 */
async function seedPosts(university) {
	const pacts = await Pact.find({university : university})
	await populatePacts(pacts);
	console.log(`Finished seeding posts and comments`);
}

/**
 * Create 20 random posts and populate them for a given list of pacts
 * 
 * @param pacts - pacts to be populated
 */
async function populatePacts(pacts) {
	// Generate 20 random posts for each pact
	for (let i = 0; i < pacts.length; i++) {
		await generateRandomPosts(pacts[i], 20);
		const posts = await Post.find({ pact: pacts[i] });
		await populatePosts(pacts[i], posts);
	}
}

/**
 * Generate a number of posts and add them to a pact
 * 
 * @param pact - pact to generate random posts in 
 * @param numberOfPosts - number of posts to generate
 */
async function generateRandomPosts(pact, numberOfPosts) {

	// The three different post generation methods
	const generators = [generateRandomTextPost, generateRandomImagePost, generateRandomLinkPost];
	
	// For each post, randomly pick a post type, either text, image, or link.
	for (let i = 0; i < numberOfPosts; i++) {
		const randomGenerator = generators[chance.integer({ min: 0, max: generators.length-1 })];
		const post =  await randomGenerator(pact);
		await populateVotes(post, pact);
	}
}

/**
 * Create a new text post for a pact
 * 
 * @param pact - pact to add the post to 
 * @returns a new text post
 */
async function generateRandomTextPost(pact) {
	// const title = chance.sentence({ words: 2 });
	const title = randQuote().substring(0,200);
	const post  = await createPost(pact, getRandomAuthor(pact), title, {text : randQuote() + " " + randQuote()});
	return post;
}

/**
 * Create a new image post for a pact
 * 
 * @param pact - pact to add the post to 
 * @returns a new image post
 */
async function generateRandomImagePost(pact) {
	const title = randQuote().substring(0,200);
	const post = await createPost(pact, getRandomAuthor(pact), title, {  type: "image", image : getImageLink(title)});
	return post;
}

/**
 * Create a new link post for a pact
 * 
 * @param pact - pact to add the post to 
 * @returns a new link post
 */
async function generateRandomLinkPost(pact) {
	const title = randQuote().substring(0,200);
	const post = await createPost(pact, getRandomAuthor(pact), title, {  type: "link", link : getRandomLink()});
	return post;
}

/**
 * Creat a new post 
 * 
 * @param pact - post pact
 * @param author - post author
 * @param title - post title
 * @param options - post type, image URL, text, and link
 * @returns the new post
 */
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

/**
 * Populate a list of posts with comments
 * 
 * @param pact - pact the posts belong to 
 * @param posts - list of posts
 */
async function populatePosts(pact, posts) {
	for (let i = 0; i < posts.length; i++) {
		await generateRandomComments(pact, posts[i], chance.integer({ min: 0, max: 3 }));
	}
}

/**
 * Populate a comment by adding a child comments to is
 * 
 * @param pact - pact a post belongs to
 * @param post - post the comments need to be added to
 * @param comment - comment that needs to be populated
 * @returns 
 */
async function populateComment(pact, post, comment) {
	const childComment = await generateRandomComments(pact, post, chance.integer({ min: 0, max: 3 }), {parentComment: comment});
	return childComment;
}

/**
 * Generate comments for a post
 * 
 * @param pact - pact a post belongs to
 * @param post - post a comment needs to be created for
 * @param numberOfComments - number of comments to be generated
 * @param options - parent comment for comment (if it exists)
 */
async function generateRandomComments(pact, post, numberOfComments, options={parentComment: undefined}) {
	for (let i = 0; i < numberOfComments; i++) {
		const comment = await createRandomComment(pact, post, options);
		await populateVotes(comment, pact);
		if (!options.parentComment) {
			await populateComment(pact, post, comment);
		}
	}
}

/**
 * Creat a new random comment
 * 
 * @param pact - pact the parent post belongs to 
 * @param post - post the comment should be added to
 * @param options - parent comment (if it exists)
 * @returns 
 */
async function createRandomComment(pact, post, options={parentComment: undefined}) {
	const comment = await createComment(post, getRandomAuthor(pact), randQuote().substring(0,150), options);
	return comment;
}

/**
 * Create a new comment for a given author containing specified text
 * 
 * @param post - post the comment should be added to
 * @param author - comment author
 * @param text - comment text
 * @param options - parent comment (if it exists) 
 * @returns the comment that was created 
 */
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

/**
 * Return a random user to use as a post/comment author
 * 
 * @param pact - pact to retrieve random author from 
 * @returns the random author 
 */
function getRandomAuthor(pact) {
	const author = pact.members[chance.integer({ min: 0, max: pact.members.length-1 })];
	return author;
}

/**
 * Populate a post or comment with votes
 * 
 * @param obj - post or comment to populate 
 * @param pact - pact the post or comment belongs to
 */
async function populateVotes(obj, pact) {
	const { members } = pact;
	
	const voteOptions = [populateUpvote, populateDownvote, async (obj, member) => {}]
	// For each member of a pact, either have them upvote or downvote a post/comment
	for (let i = 0; i < members.length; i++) {
		const member = members[i];
		const voteFunction = voteOptions[chance.integer({ min: 0, max: voteOptions.length-1 })];
		await voteFunction(obj, member);
	}
}

/**
 * Populate a post or comment with an upvote
 * 
 * @param obj - post or comment to upvote 
 * @param member - user upvoting the post or comment
 */
async function populateUpvote(obj, member) {
	obj.upvoters.push(member);
	obj.votes = obj.votes + 1;
	await obj.save();
}

/**
 * Populate a post or comment with a downvote
 * 
 * @param obj - post or comment to downvote 
 * @param member - user downvoting the post or comment
 */
async function populateDownvote(obj, member) {
	obj.downvoters.push(member);
	obj.votes = obj.votes - 1;
	await obj.save();
}

/**
 * Return a random link to create a link post with
 * @returns a random link
 */
function getRandomLink() {
	const link = LINKS[chance.integer({ min: 0, max: LINKS.length - 1 })];
	return link;
}

/**
 * Return a random image from unsplash
 * 
 * @param title - title of the post 
 * @returns random unsplash image link
 */
function getImageLink(title) {
	const link = `https://source.unsplash.com/random/${title.slice(0, -1)}`;
	return link;
}

module.exports.seedPosts = seedPosts;
