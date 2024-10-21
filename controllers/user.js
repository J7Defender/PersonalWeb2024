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

  console.log(`User ${email} and password ${password}`);

  if (user && (await bcrypt.compare(password, user.password))) {
    req.loginSuccess = true;
    res.cookie("access_token", generateToken(user.email, user.password), { httpOnly: true });
  } else {
    req.loginSuccess = false;
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
  } else {
    req.registerSuccess = false;
  }

  next();
});

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('access_token');
  res.redirect('/');
})

export { loginUser, registerUser, logoutUser };
