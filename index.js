import express from "express";
import bodyParser from "body-parser";
import logger from "morgan";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import {loginUser, registerUser, logoutUser} from "./controllers/userController.js";
import {authenticate} from "./controllers/authController.js";
import {getNotesList, getNote, createNote, loadNote} from "./controllers/noteController.js";
import {JWT_SECRET} from "./config/config.js";

import {dirname} from "path";
import {fileURLToPath} from "url";

// Connect to MongoDB using Mongoose
import("./config/database.js");

// Import routes
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// These public paths can be accessed without being authenticated
const publicPaths = ["/signin", "/register", "/"];

// Use public directory for css and other assets
app.use(express.static(__dirname + '/public'));

// Set environment variables
// TODO: Set these flags in .env file
process.env.JWT_SECRET = JWT_SECRET;
process.env.DEBUG_ENABLED = "true";

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan("dev"));
// TODO: Try to use flags to enable or disable logging

// Return No content for favicon requests (default browser behavior) => Include later if needed
app.get("/favicon.ico", (req, res) => {
	return res.sendStatus(204);
});

app.use(authenticate, (req, res, next) => {
	if (req.method === "GET" && !req.authenticateSuccess && !publicPaths.includes(req.path)) {
		return res.redirect("/signin");
	}

	req.authenticateSuccess = req.authenticateSuccess || false;
	return next();
});

app.use("/", userRoutes);
app.use("/", noteRoutes);

app.get("/", (req, res) => {
	return res.render("index", {
		title: "Index",
		authenticated: req.authenticateSuccess,
	});
});

// Handle 404 requests
app.get("*", (req, res) => {
	return res.render("404", {
		title: "Page Not Found",
	});
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
