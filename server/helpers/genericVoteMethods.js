module.exports.upvote = async (obj) => {
  try{
    if(obj.downvoters.includes(req.user._id)) {
      // Cancel downvote
      const index = obj.downvoters.indexOf(req.user._id);
      obj.downvoters.splice(index, 1); 
      obj.votes = post.votes + 1;
    } 
    else if(obj.upvoters.includes(req.user._id)) {
      // Remove upvote
      const index = obj.upvoters.indexOf(req.user._id);
      obj.upvoters.splice(index, 1);
      obj.downvoters.push(req.user._id);
      obj.votes = post.votes - 2;
    } else {
      // Standard downvote
      obj.downvoters.push(req.user._id);
      obj.votes = post.votes - 1;
    }
    obj.save()
    return obj;
  }
  catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}