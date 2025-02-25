import mongoose from "mongoose";

const noteSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, // Maximum length of 16 Megabytes
  },
  shorten: {
    type: String, // Maximum length of 16 Megabytes
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// TODO: Implement for storing much longer text using GridFS

const Note = mongoose.model("Note", noteSchema, "note");

export { Note };
