const Pact = require("../../models/Pact");

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

  await foundingUser.university.pacts.push(pact);
  foundingUser.university.save();

  await foundingUser.pacts.push(pact);
  await foundingUser.save();

  return pact;
}