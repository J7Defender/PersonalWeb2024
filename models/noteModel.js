import mongoose from "mongoose";

const noteSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, // Maximum length of 16 Megabytes
  },
});

// TODO: Implement for storing much longer text using GridFS

const Note = mongoose.model("note", noteSchema, "note");

export { Note };
