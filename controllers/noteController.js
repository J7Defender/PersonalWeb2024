import mongoose, { get } from "mongoose";
import asyncHandler from "express-async-handler";
const Schema = mongoose.Schema;
import { User } from "../models/userModel.js";
import { Note } from "../models/noteModel.js";
import { decodeToken } from "./authController.js";
import { getId, isLoggedIn, getUser } from "./userController.js";

const getNotesList = asyncHandler(async (req, res, next) => {
  const _id = getId(req.cookies.access_token);
  const userObj = await User.findOne({ _id: _id }).populate("notes").exec();

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

const createNote = asyncHandler(async (req, res, next) => {
  let note;
  try {
    const _id = getId(req.cookies.access_token);

    note = await Note.create({
      title: "Untitled",
      content: "",
      shorten: "",
      owner: _id,
    });
    await note.save();

    const user = await User.findOne({ _id: _id });
    user.notes.push(note);
    await user.save();

    if (note) {
      console.log("Note created successfully");
      return res.redirect("/note/" + note._id);
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
  const _id = getId(req.cookies.access_token);
  const userObj = await User.findOne({ _id: _id }).populate("notes").exec();

  const noteId = req.params.id;
  const note = userObj.notes.find((note) => note._id == noteId);
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  return res.render("note", {
    title: "Note",
    authenticated: true,
    noteTitle: note.title,
    content: note.content,
    _id: noteId,
  });
});

const saveNote = asyncHandler(async (req, res, next) => {
  // TODO: Save note content to database
  const _id = getId(req.cookies.access_token);
  const userObj = await User.findOne({ _id: _id }).populate("notes").exec();

  const noteId = req.params.id;
  const note = userObj.notes.find((note) => note._id == noteId);

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  note.title = req.body.title;
  note.content = req.body.content;
  note.shorten = req.body.content ? (req.body.content.substring(0, 20) + " ...") : "";

  try {
    await note.save();
    console.log("[noteController] Note updated successfully");
    return res.redirect("/list");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to update note" });
  }
});

export { getNotesList, createNote, loadNote, saveNote };
