import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";

// Check if user has logged in using correct information
const authenticate = asyncHandler(async (req, res, next) => {
  if (req.cookies.access_token) {
    try {
      // Decode the access token
      const decoded = jwt.verify(
        req.cookies.access_token,
        process.env.JWT_SECRET
      );

      // Find user in database and check if password is correct
      const user = await User.findOne({ email: decoded.email });
      if (user) {
        // User exists in database
        console.log("[authenticate] We found user in database");
        if (decoded.password === user.password) {
          // Password is correct
          req.authenticateSuccess = true;
          console.log("[authenticate] Password is correct");
          next();
        } else {
          // Pasword is NOT correct
          req.authenticateSuccess = false;
          console.log("[authenticate] Password is incorrect");
          next();
        }
      } else {
        next();
      }
    } catch (err) {
      res.clearCookie("access_token");
      console.log("[authenticate] Error: " + err);
      console.log("[authenticate] Error: Clearing cookie");
    }
  }

  next();
});

const generateToken = (email, password) => {
  return jwt.sign(
    { email: email, password: password },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export { authenticate, generateToken };
