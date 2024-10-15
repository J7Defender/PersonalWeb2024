import express from "express";
import bodyParser from "body-parser";
import logger from "morgan";
import { loginUser, registerUser } from "./controllers/user.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { title } from "process";

// Connect to MongoDB using Mongoose
import("./config/database.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index", {
    title: "Index",
  });
});

app.get("/signin", (req, res) => {
  res.render("signin", {
    title: "Sign in",
  });
});

app.post("/signin", loginUser, (req, res) => {
  if (req.userExists && req.correct) {
    res.redirect("/");
  } else {
    res.redirect("/signin");
  }
});

app.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
  });
});

app.post("/register", registerUser, (req, res) => {
  if (req.success) {
    res.redirect("/signin");
  } else {
    res.redirect("/register");
  }
});

app.get("/newrequest", (req, res) => { 
  res.render("newrequest", {
    title: "New Request",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
