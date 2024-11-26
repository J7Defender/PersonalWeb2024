import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { User } from "../models/user.js";
import { generateToken } from "./auth.js";

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
  if (user) {
    req.userExists = true;
  } else {
    req.userExists = false;
    next();
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    req.loginSuccess = true;
    res.cookie("access_token", generateToken(user.email, user.password), {
      httpOnly: true,
    });
    console.log("User logged in successfully");
  } else {
    req.loginSuccess = false;
    console.log("User has entered the wrong username or password");
  }

  next();
});

const registerUser = asyncHandler(async (req, res, next) => {
  const { email, password, fullName, lastRequestDate } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    req.userExists = true;
    next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(password, salt);

  // Create user in database
  let user;
  try {
    user = await User.create({
      email: email,
      password: hashedpassword,
      fullName: fullName,
      lastRequestDate: lastRequestDate,
    });
  } catch (error) {
    console.log(error);
  }

  if (user) {
    req.registerSuccess = true;
    console.log("User registered successfully");
  } else {
    req.registerSuccess = false;
    console.log("User registration failed");
  }

  next();
});

const logoutUser = asyncHandler(async (req, res, next) => {
  res.clearCookie("access_token", { httpOnly: true });
  res.redirect("/");

  next();
});

export { loginUser, registerUser, logoutUser };
