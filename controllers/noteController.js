import mongoose, { get } from "mongoose";
import asyncHandler from "express-async-handler";
const Schema = mongoose.Schema;
import { User } from "../models/userModel.js";
import { Note } from "../models/noteModel.js";
import { decodeToken } from "./authController.js";
import { getEmail, isLoggedIn, getUser } from "./userController.js";

const getNotesList = asyncHandler(async (req, res, next) => {
  const email = getEmail(req.cookies.access_token);
  const userObj = await User.findOne({ email: email });

  if (!userObj) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    return res.render("list", {
      title: "List",
      authenticated: true,
      notes: userObj.notes,
    });
  } catch (err) {
    console.log(err);
  }

  return res.render("list", {
    title: "List",
    authenticated: true,
    notes: [],
  });
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

const createNote = asyncHandler(async (req, res, next) => {
  let note;
  try {
    user = getUser(req.cookies.access_token);

    note = await Note.create({
      title: "New Note",
      content: "",
      shorten: "",
      owner: user._id,
    });

    if (note) {
      console.log("Note created successfully");
      return res.redirect("/note/edit/" + note._id);
    } else {
      console.log("Note creation failed");
      req.flash("error", "Note creation failed. Please try again.");
      return res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});

const loadNote = asyncHandler(async (req, res, next) => {
  const email = getEmail(req.cookies.access_token);
  const userObj = await User.findOne({ email: email });
});

export { getNotesList, getNote, createNote, loadNote };
