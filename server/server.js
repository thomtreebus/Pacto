const app = require("./app");
const mongoose = require("mongoose");
const fs = require('fs');
const https = require("https");
const port = process.env.PORT || 8000;
const isProd = process.env.IS_PROD === "true";

const start = async () => {
	await mongoose.connect(process.env.DB_CONNECTION_URL);

	console.log("Connected to the database!");

	// Https setup derived from https://stackoverflow.com/questions/11744975/enabling-https-on-express-js
	// and https://timonweb.com/javascript/running-expressjs-server-over-https/
	if(isProd){
		const pkey  = fs.readFileSync('/etc/nginx/ssl/live/pacto.co.uk/privkey.pem', 'utf8');
		const cert = fs.readFileSync('/etc/nginx/ssl/live/pacto.co.uk/fullchain.pem', 'utf8');
		https
			.createServer(
				{
					key: pkey,
					cert: cert,
				},
				app
			)
			.listen(port, async () => {
		})
	} else{
		app.listen(port, async () => {
		});
	}
	console.log(`Server is running on port: ${port}`);
} 

start();
