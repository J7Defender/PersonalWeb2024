import express from "express";
import bodyParser from "body-parser";
import logger from "morgan";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { loginUser, registerUser, logoutUser } from "./controllers/user.js";
import { authenticate } from "./controllers/auth.js";
import { JWT_SECRET } from "./config/config.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { title } from "process";

// Connect to MongoDB using Mongoose
import("./config/database.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Set environment variables
process.env.JWT_SECRET = JWT_SECRET;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("tiny"));
// TODO: Try to use flags to enable or disable logging

app.get("/", authenticate, (req, res) => {
  if (req.authenticateSuccess) { 
    res.render("index", {
      title: "Index",
      authenticated: true,
    });
  } else {
    res.render("index", {
      title: "Index",
      authenticated: false,
    });
  }
});

app.get("/signin", authenticate, (req, res) => {
  if (req.authenticateSuccess) {
    res.redirect("/");
    console.log("[indexed.js] User already logged in");
  }

  res.render("signin", {
    title: "Sign in",
  });
});

app.post("/signin", loginUser, (req, res) => {
  if (req.userExists && req.loginSuccess) {
    res.redirect("/");
  } else {
    res.redirect("/signin");
  }
});

app.get("/register", authenticate, (req, res) => {
  if (req.userLoggedIn) {
    res.redirect("/");
  }

  res.render("register", {
    title: "Register",
  });
});

app.post("/register", registerUser, (req, res) => {
  if (req.userExists) {
    // TODO: Handle if user already exists
  }

  if (req.registerSuccess) {
    res.redirect("/signin");
  } else {
    res.redirect("/register");
    // TODO: Handle if user has failed to register
  }
});

app.get("/newrequest", (req, res) => {
  res.render("newrequest", {
    title: "New Request",
  });
});

app.get("/logout", logoutUser, (req, res) => {
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
