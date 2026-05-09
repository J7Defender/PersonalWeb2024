import express from "express";
import bodyParser from "body-parser";
import logger from "morgan";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Authentication temporarily disabled
// import {authenticate} from "./controllers/authController.js";

import {dirname} from "path";
import {fileURLToPath} from "url";

// Import config
import { publicPaths } from "./config/config.js";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import toolRoutes from "./routes/toolsRoutes.js";

// Import dotenv
dotenv.config();

// Database connection disabled for offline mode
// import("./config/database.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Use public directory for css and other assets
app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
// TODO: Try to use flags to enable or disable logging

// Return No content for favicon requests (default browser behavior) => Include later if needed
app.get("/favicon.ico", (req, res) => {
	return res.sendStatus(204);
});

// Authentication middleware temporarily disabled to remove login requirement
// app.use(authenticate, (req, res, next) => {
// 	if (req.method === "GET" && !req.userId && !publicPaths.includes(req.path)) {
// 		return res.redirect("/signin");
// 	}
// 
// 	return next();
// });

app.use("/", userRoutes);
// Note routes temporarily disabled
// app.use("/", noteRoutes);
app.use("/", toolRoutes);

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

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
