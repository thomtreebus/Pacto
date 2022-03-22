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
const pactRoute = require("./routes/pact");
app.use("/", pactRoute);

const commentRoute = require("./routes/comment");
app.use("/", commentRoute);

const postRoute = require("./routes/post");
app.use("/", postRoute);

const uniRoute = require("./routes/university");
app.use("/", uniRoute);

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

app.use("/", authRoutes);
app.use("/users", userRoutes)

app.get("/ping", (req, res) => {
	res.json({ ping: "pong" });
});

module.exports = app;
