import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";

// Check if user has logged in using correct information
const authenticate = asyncHandler(async (req, res, next) => {
  if (req.cookies.access_token) {
    try {
      // Decode the access token
      const decoded = decodeToken(req.cookies.access_token);

      // TODO: Find if there is any other way to check while not having to find user in database
      // Find user in database and check if password is correct
      const user = await User.findById(decoded._id);
      if (!user) {
        req.userId = undefined;
        return next();
      }

      // User exists in database
      console.log("[authenticate] We found user in database");
      if (decoded.password === user.password) {
        // Password is correct
        req.userId = decoded._id;
        console.log("[authenticate] Password is correct");
      } else {
        // Password is NOT correct
        req.userId = undefined;
        console.log("[authenticate] Password is incorrect");
      }
      return next();
    } catch (err) {
      res.clearCookie("access_token");
      console.log("[authenticate] Error: " + err);
      console.log("[authenticate] Error: Clearing cookie");
      req.userId = undefined;
      return next();
    }
  } else {
    console.log("[authenticate] No access token found");
    console.log("[authenticate] User is not authenticated");
    req.userId = undefined;
    return next();
  }
});

const generateToken = (_id, password) => {
  return jwt.sign(
    { _id: _id, password: password },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

const generateHashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const decodeToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export { authenticate, generateToken, decodeToken, generateHashPassword };
