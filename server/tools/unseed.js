const mongoose = require("mongoose");
const dotenv = require("dotenv");
const {unseed} = require("./unseeder");

dotenv.config();

mongoose.connect(process.env.DB_CONNECTION_URL, async () => {
	console.log("Connected to the database!");
	await unseed();
	process.exit();
});
