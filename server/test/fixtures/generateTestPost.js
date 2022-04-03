const Pact = require("../../models/Pact");
const Post = require("../../models/Post");
const User = require("../../models/User");

let myPost = null;

module.exports.generateTestPost = async (postingUser, userPact, title="Dummy title", text="Dummy text", type="text", link="https://example.com") => {
  if(!postingUser.active){
    throw Error("The posting user provided is not active")
  }

  const post = await Post.create({
    pact: userPact,
    author: postingUser,
    title: title,
    text: text,
    type: type,
    link: link
  });

  await post.populate({ path: 'pact', model: Pact });
  await post.populate({ path: 'author', model: User });

  userPact.posts.push(post);
  await userPact.save();

  myPost = post;
  return post;
}

// Return ID of most recent post to be generated
module.exports.getTestPostId = () => {
  if (myPost) {
    return myPost._id;
  } else {
    throw Error("post not generated")
  }
}