import mongoose, { get } from "mongoose";
import asyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";
import { Note } from "../models/noteModel.js";

const getNotesList = asyncHandler(async (req, res, next) => {
  const userObj = await User.findById(req.userId).populate("notes").exec();

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
    note = await Note.create({
      title: "Untitled",
      content: "",
      shorten: "",
      owner: req.userId,
    });
    await note.save();

    const user = await User.findById(req.userId);
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
  const userObj = await User.findById(req.userId).populate("notes").exec();

  const noteId = req.params.id;
  const note = userObj.notes.find((note) => note._id == noteId);
  if (!note) {
    return res.status(404).json({ message: "Note not found or is not yours" });
  }

  // TODO: Find better way to check if note is not yours
  // Do by server only and record logs for unauthorized access

  return res.render("note", {
    title: "Note",
    authenticated: true,
    noteTitle: note.title,
    content: note.content,
    _id: noteId,
  });
});

const saveNote = asyncHandler(async (req, res, next) => {
  const userObj = await User.findById(req.userId).populate("notes").exec();

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
