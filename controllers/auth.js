import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models/user.js";

const authenticate = asyncHandler(async (req, res, next) => {
  if (req.cookies.access_token) {
    // Decode the access token
    const decoded = jwt.verify(
      req.cookies.access_token,
      process.env.JWT_SECRET
    );

    // Find user in database and check if password is correct
    const user = await User.findOne({ email: email });
    if (user) {
      // User exists in database
      if (await bcrypt.compare(password, user.password)) {
        // Password is correct
        req.authenticateSuccess = true;
        next();
      } else {
        // Pasword is NOT correct
        req.authenticateSuccess = false;
        next();
      }
    } else {
      next();
    }
  } else {
    res.clearCookie("access_token");
  }

  next();
});

const generateToken = (email, password) => {
  return jwt.sign({ email, password }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export { generateToken };
