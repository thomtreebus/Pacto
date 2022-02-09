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