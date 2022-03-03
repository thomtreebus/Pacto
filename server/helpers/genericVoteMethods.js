const {jsonResponse, jsonError} = require("../helpers/responseHandlers");

module.exports.downvote = async (obj) => {
  try{
    if(obj.downvoters.includes(req.user._id)) {
      // Cancel downvote
      const index = obj.downvoters.indexOf(req.user._id);
      obj.downvoters.splice(index, 1); 
      obj.votes = obj.votes + 1;
    } 
    else if(obj.upvoters.includes(req.user._id)) {
      // Remove upvote
      const index = obj.upvoters.indexOf(req.user._id);
      obj.upvoters.splice(index, 1);
      obj.downvoters.push(req.user._id);
      obj.votes = obj.votes - 2;
    } else {
      // Standard downvote
      obj.downvoters.push(req.user._id);
      obj.votes = obj.votes - 1;
    }
    obj.save()
    return obj;
  }
  catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports.upvote = async (obj) => {
  try{
    if(obj.upvoters.includes(req.user._id)) {
      // Cancel upvote
      const index = obj.upvoters.indexOf(req.user._id);
      obj.upvoters.splice(index, 1); 
      obj.votes = obj.votes - 1;
    } 
    else if(obj.downvoters.includes(req.user._id)) {
      // Remove downvote
      const index = obj.downvoters.indexOf(req.user._id);
      obj.downvoters.splice(index, 1);
      obj.upvoters.push(req.user._id);
      obj.votes = obj.votes + 2;
    } else {
      // Standard upvote
      obj.upvoters.push(req.user._id);
      obj.votes = obj.votes + 1;
    }
    obj.save()
    return obj;
  }
  catch(err){
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}