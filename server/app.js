const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

const corsOptions  = {
	origin: process.env.CORS_URL, //frontend url
	credentials: true
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes

const authRoute = require("./routes/auth");
app.use("/", authRoute);

app.get("/ping", (req, res) => {
	res.json({ ping: "pong" });
});

module.exports = app;
