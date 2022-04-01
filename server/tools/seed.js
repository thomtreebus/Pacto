const mongoose = require("mongoose");
const {unseed} = require("./unseeder");
const {seed} = require("./seeder");
const dotenv = require("dotenv");

dotenv.config();
/**
 * Connect to the database and run the seeder.
 */
mongoose.connect(process.env.DB_CONNECTION_URL, async () => {
	console.log("Connected to the database!");
	await unseed(); // Clear the entire database
	await seed(); // Seed the database
	process.exit(); // Disconnect
});
