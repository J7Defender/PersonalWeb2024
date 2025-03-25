import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcryptjs";
import session from "express-session";

import {User} from "./models/userModel.js";

import {dirname} from "path";
import {fileURLToPath} from "url";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
// Import dotenv
dotenv.config();

// Connect to MongoDB using Mongoose
import("./config/database.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Use public directory for css and other assets
app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan("dev"));
// TODO: Try to use flags to enable or disable logging

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Return No content for favicon requests (default browser behavior) => Include later if needed
app.get("/favicon.ico", (req, res) => {
	return res.sendStatus(204);
});

app.use("/", userRoutes);
app.use("/", noteRoutes);

app.get("/", (req, res) => {
	return res.render("index", {
		title: "Index",
		authenticated: req.isAuthenticated(),
	});
});

// Handle 404 requests
app.get("*", (req, res) => {
	return res.render("404", {
		title: "Page Not Found",
	});
});

passport.use(new Strategy(
	{ usernameField: "email", passwordField: "password" },
	async function verify(email, password, done) {
		console.log("[verify] Verifying user");
		try {
			const user = await User.findOne({ email: email });
			if (!user) {
				return done(null, false);
			}
		
			// User exists in database
			console.log("[verify] We found user in database");
			const hashedPassword = user.password;
			if (bcrypt.compare(password, hashedPassword)) {
				// Password is correct
				console.log("[verify] Password is correct");
				return done(null, user);
			} else {
				// Password is NOT correct
				console.log("[verify] Password is incorrect");
				return done(null, false);
			}
			return done(null, false);
		} catch (err) {
			console.log("[authenticate] Error: " + err);
			return done(null, false);
		}
	}
));

passport.serializeUser((user, cb) => {
	console.log("[serializeUser] Serializing user");
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
	console.log("[deserializeUser] Deserializing user");
  cb(null, user);
});

app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});
