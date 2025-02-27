import express from "express";
import { createNote, getNotesList, loadNote, saveNote } from "../controllers/noteController.js";

const router = express.Router();

// Handle note creation
router.post("/note/new", createNote);

// Get list of notes
router.get("/list", getNotesList);

// Get note by id
router.get("/note/:id", loadNote);

// Save note by id
router.post("/note/:id", saveNote);

export default router;