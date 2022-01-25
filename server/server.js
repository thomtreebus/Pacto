const app = require("./app");
const mongoose = require("mongoose");

const port = process.env.PORT || 8000;

mongoose.connect(process.env.DB_CONNECTION_URL, () => {
	console.log("Connected to the database!");
});

app.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});
