module.exports.getDefaultTestUser = () => {

  const USER_EMAIL = "pac.to@kcl.ac.uk";

  const user = {
    firstName: "pac",
    lastName: "to",
    uniEmail: USER_EMAIL,
    password: "Password123",
    course: "Art",
    bio: "Art is thou",
    image: "https://example.com/image1.jpg",
    hobbies: [
      "Art",
      "Drawing"
    ],
    location: "London",
  }

  return user;
};
