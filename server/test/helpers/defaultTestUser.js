module.exports.getDefaultTestUser = () => {

  const USER_EMAIL = "pac.to@kcl.ac.uk";

  const user = {
    firstName: "pac",
    lastName: "to",
    uniEmail: USER_EMAIL,
    password: "Password123",
  }

  return user;
};
