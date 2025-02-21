import mongoose from "mongoose";

const noteSchema = mongoose.Schema({
  title: {
    type: String,
    default: "New Note", // Default value for content
    required: true,
  },
  content: {
    type: String, // Maximum length of 16 Megabytes
  },
  shorten: {
    type: String, // Maximum length of 16 Megabytes
  }
});

// TODO: Implement for storing much longer text using GridFS

const Note = mongoose.model("note", noteSchema, "note");

export { Note };
