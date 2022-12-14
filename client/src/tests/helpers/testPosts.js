/**
 * A file to store the test posts used by some tests.
 */

/**
 * The test pacts list which can be used by other helper
 * files.
 */
const testPosts = [
  {
    pact: {
      _id : 5,
      moderators: []
    },
    author: {
      firstName: "Krishi",
      lastName: "Wali",
      _id: 1
    },
    title: "Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
    text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
    type: "text",
    votes: 6,
    upvoters: [1,2],
    downvoters: [3,4],
    createdAt: new Date(Date.now() - (86400000) * 2).toISOString(),
    comments: [0,0,0,0],
    _id: 1
  },
  {
    pact: {
      _id : 6,
      moderators: []
    },
    author: {
      firstName: "Krishi",
      lastName: "Wali",
      _id: 1
    },
    title: "Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
    link: "https://github.com/thom-treebus",
    type: "link",
    votes: 6,
    upvoters: [1,2],
    downvoters: [3,4],
    createdAt: new Date(Date.now() - (86400000) * 1).toISOString(),
    comments: [0,0,0,0],
    _id: 2
  },
  {
    pact: {
      _id : 7,
      moderators: []
    },
    author: {
      firstName: "Krishi",
      lastName: "Wali",
      _id: 1
    },
    title: "Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
    image: "https://images.unsplash.com/photo-1635834887704-18e67ae7ceba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=765&q=80",
    type: "image",
    votes: 6,
    upvoters: [1,2],
    downvoters: [3,4],
    createdAt: new Date(Date.now() - (86400000) * 5).toISOString(),
    comments: [0,0,0,0],
    _id: 3
  },
  {
    pact: {
      _id : 8,
      moderators: []
    },
    author: {
      firstName: "John",
      lastName: "Doe",
      _id: 2
    },
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
    type: "text",
    votes: 4,
    upvoters: [1,2],
    downvoters: [3,4],
    createdAt: new Date(Date.now() - (86400000) * 7).toISOString(),
    comments: [],
    _id: 4
  },
  {
    pact: {
      _id : 9,
      moderators: []
    },
    author: {
      firstName: "Jane",
      lastName: "Doe",
      _id: 3
    },
    title: "Lorem ipsum",
    text: "Lorem ipsum haha dolor inventore ad! Porro soluta eum amet officia molestias esse!",
    type: "text",
    votes: 8,
    upvoters: [1,2],
    downvoters: [3,4],
    createdAt: new Date(Date.now()).toISOString(),
    comments: [1,23,6,6,6,6,6,6,6],
    _id: 5
  },
  {
    pact: {
      _id : 10,
      moderators: []
    },
    author: {
      firstName: "Krishi",
      lastName: "Wali",
      _id: 1
    },
    title: "Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem",
    text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
    type: "text",
    votes: 6,
    upvoters: [1,2],
    downvoters: [3,4],
    createdAt: new Date(Date.now() - (86400000) * 10).toISOString(),
    comments: [0,0,0,0],
    _id: 6
  },
  {
    pact: {
      _id : 11,
      moderators: []
    },
    author: {
      firstName: "John",
      lastName: "Doe",
      _id: 2
    },
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!",
    type: "text",
    votes: 4,
    upvoters: [1,2],
    downvoters: [3,4],
    createdAt: new Date(Date.now() - (86400000) * 11).toISOString(),
    comments: [],
    _id: 7
  },
  {
    pact: {
      _id : 12,
      moderators: []
    },
    author: {
      firstName: "Jane",
      lastName: "Doe",
      _id: 3
    },
    title: "Lorem ipsum",
    text: "Lorem haha dolor inventore ad! Porro soluta eum amet officia molestias esse!",
    type: "text",
    votes: 8,
    upvoters: ["1","2"],
    downvoters: ["3","622b59a15c8e27738fdc43bd"],
    createdAt: new Date(Date.now() - (86400000) * 11).toISOString(),
    comments: [1,23,6,6,6,6,6,6,6],
    _id: 8
  },
];

export default testPosts;
