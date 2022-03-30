/**
 * General method to downvote an object.
 * For now, may only be a Comment or a Post
 * @param obj - The object to downvote
 * @param {User} usr - The user who downvotes
 */
module.exports.downvote = async (obj, usr) => {
  if(obj.downvoters.includes(usr._id)) {
    // Cancel downvote
    const index = obj.downvoters.indexOf(usr._id);
    obj.downvoters.splice(index, 1); 
    obj.votes = obj.votes + 1;
  } 
  else if(obj.upvoters.includes(usr._id)) {
    // Remove upvote
    const index = obj.upvoters.indexOf(usr._id);
    obj.upvoters.splice(index, 1);
    obj.downvoters.push(usr._id);
    obj.votes = obj.votes - 2;
  } else {
    // Standard downvote
    obj.downvoters.push(usr._id);
    obj.votes = obj.votes - 1;
  }
  await obj.save();
}

/**
 * General method to upvote an object.
 * For now, may only be a Comment or a Post
 * @param obj - The object to upvote
 * @param {User} usr - The user who upvotes
 */
module.exports.upvote = async (obj, usr) => {
  if(obj.upvoters.includes(usr._id)) {
    // Cancel upvote
    const index = obj.upvoters.indexOf(usr._id);
    obj.upvoters.splice(index, 1); 
    obj.votes = obj.votes - 1;
  } 
  else if(obj.downvoters.includes(usr._id)) {
    // Remove downvote
    const index = obj.downvoters.indexOf(usr._id);
    obj.downvoters.splice(index, 1);
    obj.upvoters.push(usr._id);
    obj.votes = obj.votes + 2;
  } else {
    // Standard upvote
    obj.upvoters.push(usr._id);
    obj.votes = obj.votes + 1;
  }
  await obj.save();
}
