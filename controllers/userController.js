import asyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";
import {
  generateToken,
  generateHashPassword,
} from "./authController.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    req.userExists = true;
    return next();
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

  return next();
});

const logoutUser = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
  });

  return next();
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

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
  const user = await User.findById(req.user._id);

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
  return !(!accessToken || accessToken === "undefined");


};

export {
  registerUser,
  logoutUser,
  isLoggedIn,
  getProfile,
  saveProfile,
};
