import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";

// Check if user has logged in using correct information
const authenticate = asyncHandler(async (req, res, next) => {
  if (req.cookies.access_token) {
    try {
      // Decode the access token
      const decoded = decodeToken(req.cookies.access_token);

      // Find user in database and check if password is correct
      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        req.authenticateSuccess = false;
        return next();
      }

      // User exists in database
      console.log("[authenticate] We found user in database");
      if (decoded.password === user.password) {
        // Password is correct
        req.authenticateSuccess = true;
        console.log("[authenticate] Password is correct");
      } else {
        // Password is NOT correct
        req.authenticateSuccess = false;
        console.log("[authenticate] Password is incorrect");
      }
      return next();
    } catch (err) {
      res.clearCookie("access_token");
      console.log("[authenticate] Error: " + err);
      console.log("[authenticate] Error: Clearing cookie");
      req.authenticateSuccess = false;
      return next();
    }
  } else {
    req.authenticateSuccess = false;
    return next();
  }
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

const decodeToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export { authenticate, generateToken, decodeToken };
