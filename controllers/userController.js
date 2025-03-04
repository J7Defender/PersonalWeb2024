import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import {
  generateToken,
  decodeToken,
  generateHashPassword,
} from "./authController.js";

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
    res.cookie("access_token", generateToken(user._id, user.password));
    console.log("User logged in successfully");
  } else {
    req.loginSuccess = false;
    console.log("User has entered the wrong username or password");
  }

  next();
});

const registerUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    req.userExists = true;
    next();
  }

  // Hash password
  const hashedpassword = await generateHashPassword(password);

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

  next();
});

const logoutUser = asyncHandler(async (req, res, next) => {
  res.clearCookie("access_token");

  next();
});

const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
  }

  try {
    res.render("profile", {
      title: "Profile",
      authenticated: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
  }
});

const saveProfile = asyncHandler(async (req, res, next) => {
  const {email, password} = req.body;
  const user = await User.findById(req.userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
  }

  try {
    user.email = email || user.email;
    if (password) {
      user.password = await generateHashPassword(password);
    }
    await user.save();
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "User profile update failed" });
  }
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

  return User.findById(userId);
};

export {
  loginUser,
  registerUser,
  logoutUser,
  isLoggedIn,
  getEmail,
  getId,
  getUserByToken,
  getUserById,
  getProfile,
  saveProfile,
};
