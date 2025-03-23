import { User } from "../models/userModel.js";
import { decodeToken } from "../controllers/authController.js";

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

const getUserByToken = async (accessToken) => {
  if (!accessToken || accessToken === "undefined") {
    return null;
  }

  let user;
  try {
    user = await User.findById(decodeToken(accessToken)._id);
  } catch (err) {
    console.log(err);
  }

  return user;
};

const getUserById = async (userId) => {
  if (!userId || userId === "undefined") {
    return null;
  }

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    console.log(err);
  }

  return user;
};

const getUserWithNotes = async (userId) => {
  if (!userId || userId === "undefined") {
    return null;
  }

  let user;
  try {
    user = await User.findById(userId).populate("notes").exec();
  } catch (err) {
    console.log(err);
  }

  return user;
};

const getNoteById = async (userObj, noteId) => {
  if (!noteId || noteId === "undefined" || !userObj) {
    return null;
  }

  let note;
  try {
    note = await userObj.notes.find((note) => note._id == noteId);
  } catch (err) {
    console.log(err);
  }

  return note;
};

export {
  getEmail,
  getId,
  getUserByToken,
  getUserById,
  getUserWithNotes,
  getNoteById
};
