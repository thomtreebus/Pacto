const mongoose = require("mongoose");
const {unseed} = require("./unseeder");
const {seed} = require("./seeder");
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(process.env.DB_CONNECTION_URL, async () => {
	console.log("Connected to the database!");
	await unseed();
	await seed();
	process.exit();
});
