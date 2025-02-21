import express from "express";
import bodyParser from "body-parser";
import logger from "morgan";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import {loginUser, registerUser, logoutUser} from "./controllers/userController.js";
import {authenticate} from "./controllers/authController.js";
import {getNotesList, getNote} from "./controllers/noteController.js";
import {JWT_SECRET} from "./config/config.js";

import {dirname} from "path";
import {fileURLToPath} from "url";

// Connect to MongoDB using Mongoose
import("./config/database.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

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

app.get("/", authenticate, (req, res) => {
	if (req.authenticateSuccess) {
		return res.render("index", {
			title: "Index",
			authenticated: true,
		});
	} else {
		return res.render("index", {
			title: "Index",
			authenticated: false,
		});
	}
});

app.get("/signin", authenticate, (req, res) => {
	if (req.authenticateSuccess) {
		console.log("[indexed.js] User already logged in");
		return res.redirect("/");
	}

	res.render("signin", {
		title: "Sign in",
	});
});

app.post("/signin", loginUser, (req, res) => {
	if (req.userExists && req.loginSuccess) {
		return res.redirect("/");
	} else {
		return res.render("signin", {
			title: "Sign in",
		});
	}
});

app.get("/register", authenticate, (req, res) => {
	if (req.authenticateSuccess) {
		return res.redirect("/");
	}

	return res.render("register", {
		title: "Register",
	});
});

app.post("/register", registerUser, (req, res) => {
	if (req.userExists) {
		// TODO: Handle if user already exists
		return res.render("register", {
			title: "Register",
			error: "User already exists",
		});
	}

	if (req.registerSuccess) {
		return res.redirect("/signin");
	} else {
		return res.render("register", {
			title: "Register",
			error: "Registration failed",
		});
		// TODO: Handle if user has failed to register
	}
});

// Handle note creation
app.post("/note/new", authenticate, (req, res) => {
	if (!req.authenticateSuccess) {
		return res.redirect("/signin");
	}

	// TODO: Generate new id for a note
	let id = 0; // Test value

	return res.redirect("/note/edit/" + id);
});

// Handle note editing
app.post("/note/edit/:id", authenticate, (req, res) => {
	if (!req.authenticateSuccess) {
		return res.redirect("/signin");
	}

	// TODO: Render page for editing note
	return res.render("note", {
		title: "Edit Note",
		authenticated: true,
		id: req.params.id,
	});
});

// Get list of notes
app.get("/list", authenticate, getNotesList);

// Get note by id
app.get("/note/:id", authenticate, (req, res) => {
	if (!req.authenticateSuccess) {
		return res.redirect("/signin");
	}

	return res.render("note", {
		title: "Note",
		authenticated: true,
		id: req.params.id,
	});
});

app.get("/logout", logoutUser, (req, res) => {
	return res.redirect("/");
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
