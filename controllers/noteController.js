import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
const Schema = mongoose.Schema;
import { User } from "../models/userModel.js";
import { Note } from "../models/noteModel.js";
import { decodeToken } from "./authController.js";
import { getEmail, isLoggedIn } from "./userController.js";

const getNotesList = asyncHandler(async(req, res, next) => {
  if (!isLoggedIn()) {
    return res.redirect("/signin");
  }

  const email = getEmail();
  const userObj = await User.findOne({ email: req.email });

  try {
    let notes = await userObj.populate("notes").execPopulate();
    if (notes) {
      console.log(notes);
    }
  } catch (err) {
    console.log(err);
  }
});

// Get a single note from user
const getNote = asyncHandler(async (req, res, next) => {
  const currentUser = await User.findOne({ email: req.email });

  try {
    let notes = await currentUser.populate("notes").execPopulate();
    if (notes) {
      console.log(notes);
      
      // TODO: Display notes if user has that certain note
    } else {
      // TODO: Something if user has no notes
    }
  } catch (err) {
    console.log(err);

  }

});

export {getNotesList, getNote};
