import express from "express";
import bodyParser from "body-parser";
import logger from "morgan";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import {authenticate} from "./controllers/authController.js";

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

// Return No content for favicon requests (default browser behavior) => Include later if needed
app.get("/favicon.ico", (req, res) => {
	return res.sendStatus(204);
});

app.use(authenticate, (req, res, next) => {
	if (req.method === "GET" && !req.userId && !process.env.publicPaths.includes(req.path)) {
		return res.redirect("/signin");
	}

	return next();
});

app.use("/", userRoutes);
app.use("/", noteRoutes);

app.get("/", (req, res) => {
	return res.render("index", {
		title: "Index",
		authenticated: req.userId,
	});
});

// Handle 404 requests
app.get("*", (req, res) => {
	return res.render("404", {
		title: "Page Not Found",
	});
});

app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});
