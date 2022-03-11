const User = require("../models/User");
const University = require("../models/University");
const Pact = require("../models/Pact");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");

module.exports.universityGet = async (req, res) => {
  try{
    const uni = req.user.university;
    await uni.populate({path: 'users', model: User});
    await uni.populate({path: 'pacts', model: Pact});
    res.status(200).json(jsonResponse(uni, []));
  } 
  catch (err) {
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}

module.exports.search = async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const university = await University.findOne({ id: req.user.university });

    // Find all pacts matching the query string
    const pacts = Pact.find({
      university: university._id,
      name: { $regex: searchQuery }
    });

    // Find all users who's name match the query string
    const users = User.find({
      university: university._id,
      name: { $regex: searchQuery }
    });

    // Find all posts matching the query string
    const uniPacts = Pact.find({ university: university._id });
    let posts = [];
    for (let pact in uniPacts) {
      posts.concat(Post.find({ pact: pact._id, title: { $regex: searchQuery } }));
    }
    const results = {
      pacts: pacts,
      users: users,
      posts: posts
    }
    res.status(200).json(jsonResponse(uni, []));
  } 
  catch (err) {
    res.status(400).json(jsonResponse(null, [jsonError(null, err.message)]));
  }
}