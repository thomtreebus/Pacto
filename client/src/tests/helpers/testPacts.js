/**
 * A file to store the test pacts used by some tests.
 */

import users from "./testUsers";
import posts from "./testPosts"

/**
 * The test pacts list which can be used by other helper
 * files.
 */
const pacts = [
	{
		_id: 1,
		name: "Pact1",
		description: "No description provided",
		category: "course",
		image: "https://avatars.dicebear.com/api/identicon/temp.svg",
		members: [users[0]._id],
		moderators: [],
		posts: [posts[3]]
	},
	{
		_id: 2,
		name: "Pact2",
		description: "description retracted",
		category: "module",
		image: "https://avatars.dicebear.com/api/identicon/temp.svg",
		members: [],
		moderators: [],
		posts: [posts[1]]
	},
	{
		_id: 3,
		name: "Pact3",
		description: "No description provided",
		category: "society",
		image: "https://avatars.dicebear.com/api/identicon/temp.svg",
		members: [users[0]._id, users[1]._id],
		moderators: [],
		posts: [posts[0]]
	},
	{
		_id: 4,
		name: "Pact4",
		description: "No description provided",
		category: "other",
		image: "https://avatars.dicebear.com/api/identicon/temp.svg",
		members: [users[0]._id, users[1]._id, users[2]._id],
		moderators: [users[0]._id, users[1]._id],
		posts: [posts[0], posts[1]]
	},
];

export default pacts;
