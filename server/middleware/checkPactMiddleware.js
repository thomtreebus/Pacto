const User = require("../models/User");
const Pact = require("../models/Pact");
const { jsonResponse, jsonError } = require("../helpers/responseHandlers");

const checkPartOfPact = (req, res, next) => {
  try {
    const user = req.user;
    const pact = req.body.pact;
    const members = await Pact.findById(pact).members;

    if(!members.includes(user)) {
      res
        .status(401)
        .json(jsonResponse(null, [jsonError(null, "User is not in pact")]));
    } else {
      next();
    }
  } catch(err) {
    res
      .status(401)
      .json(jsonResponse(null, [jsonError(null, "Pact not found")]));  
  }
};

module.exports = { checkPartOfPact };
