const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoute = require('./routes/auth');
app.use('/', authRoute);

app.get("/ping", (req, res) => {
	res.json({ ping: "pong" });
});

module.exports = app;
