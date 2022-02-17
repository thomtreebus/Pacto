const Pact = require("../../models/Pact");
const University = require("../../models/University");

let myPact = null;

module.exports.generateTestPact = async (foundingUser) => {
  if(!foundingUser.active){
    throw Error("The founding user provided is not active")
  }

  const pact = await Pact.create({
    name: "My pact",
    description: "This is my pact.",
    category: "other",
    university: foundingUser.university,
    members: [foundingUser],
    moderators: [foundingUser]
  });

  await foundingUser.populate({ path: 'university', model: University});

  foundingUser.university.pacts.push(pact);
  await foundingUser.university.save();

  foundingUser.pacts.push(pact);
  await foundingUser.save();

  myPact = pact;
  return pact;
}

module.exports.getTestPactId = () => {
  if (myPact) {
    return myPact._id;
  } else {
    throw Error("Pact not generated")
  }
}