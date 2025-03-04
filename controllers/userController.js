import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import { generateToken, decodeToken } from "./authController.js";

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
  if (user) {
    req.userExists = true;
  } else {
    req.userExists = false;
    return next();
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    req.loginSuccess = true;
    res.cookie("access_token", generateToken(user._id, user.password));
    console.log("User logged in successfully");
  } else {
    req.loginSuccess = false;
    console.log("User has entered the wrong username or password");
  }

  return next();
});

const registerUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    req.userExists = true;
    return next();
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
    });
    await user.save();
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

  return next();
});

const logoutUser = asyncHandler(async (req, res, next) => {
  res.clearCookie("access_token");

  return next();
});

const isLoggedIn = (accessToken) => {
  if (!accessToken || accessToken === "undefined") {
    return false;
  }

  return true;
};

const getEmail = (accessToken) => {
  if (!accessToken || accessToken === "undefined") {
    return null;
  }

  return decodeToken(accessToken).email;
};

const getId = (accessToken) => {
  if (!accessToken || accessToken === "undefined") {
    return null;
  }

  return decodeToken(accessToken)._id;
};

const getUserByToken = (accessToken) => {
  if (!accessToken || accessToken === "undefined") {
    return null;
  }
  
  return User.findById(decodeToken(accessToken)._id);
};

const getUserById = (userId) => {
  if (!userId || userId === "undefined") {
    return null;
  }

  return User.findById(userId)
};

export {
  loginUser,
  registerUser,
  logoutUser,
  isLoggedIn,
  getEmail,
  getId,
  getUserByToken,
  getUserById
};
