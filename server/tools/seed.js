const BlogModel = require("../models/blogs");
const Chance = require("chance");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const chance = new Chance();
dotenv.config();

function seed() {}

mongoose.connect(process.env.DB_CONNECTION_URL, () => {
	console.log("Connected to the database!");
	seed();
});
