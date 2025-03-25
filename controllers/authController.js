import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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

export { generateToken, decodeToken, generateHashPassword };
