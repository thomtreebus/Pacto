const Chance = require("chance");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

const chance = new Chance();
dotenv.config();

async function unseed() {
	await User.deleteMany({});
	console.log("Finished unseeding");
	process.exit();
}

mongoose.connect(process.env.DB_CONNECTION_URL, () => {
	console.log("Connected to the database!");
	unseed();
});
