import asyncHandler from "express-async-handler";
import { Note } from "../models/noteModel.js";
import {getNoteById, getUserById, getUserWithNotes} from "../utils/databaseUtils.js";

const getNotesList = asyncHandler(async (req, res, next) => {
  const userObj = await getUserWithNotes(req.userId);

  console.log(userObj.notes);
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
    // Create a new note with default values in notes database
    note = await Note.create({
      title: "Untitled",
      content: "",
      shorten: "",
      owner: req.userId,
    });
    await note.save();

    // Save note to user list of notes
    const user = await getUserById(req.userId);
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
  const userObj = await getUserWithNotes(req.userId);
  const noteId = req.params.id;
  const note = await getNoteById(userObj, noteId);

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
  const userObj = await getUserWithNotes(req.userId);
  const noteId = req.params.id;
  const note = await getNoteById(userObj, noteId);

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  note.title = req.body.title;
  note.content = req.body.content;
  note.shorten = req.body.content
    ? req.body.content.substring(0, 20) + " ..."
    : "";

  try {
    await note.save();
    console.log("[noteController] Note updated successfully");
    return res.redirect("/list");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to update note" });
  }
});

const deleteNote = asyncHandler(async (req, res, next) => {
  const userObj = await getUserWithNotes(req.userId);
  const noteId = req.params.id;
  const note = await getNoteById(userObj, noteId);

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  try {
    // Remove note from userObj
    userObj.notes.pull({ _id: noteId });
    await userObj.save();

    // Delete note from db
    await note.deleteOne();
    console.log("[noteController] Note deleted successfully");
    return res.redirect("/list");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to delete note" });
  }
});

export { getNotesList, createNote, loadNote, saveNote, deleteNote };
