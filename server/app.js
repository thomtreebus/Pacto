const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { checkUser } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes

// Applying middleware to all get requests
app.get("*", checkUser);

const authRoute = require("./routes/auth");
app.use("/", authRoute);

app.get("/ping", (req, res) => {
	res.json({ ping: "pong" });
});

module.exports = app;
