import express from "express";
import { createNote, getNotesList, loadNote } from "../controllers/noteController.js";

const router = express.Router();

// Handle note creation
router.post("/note/new", createNote);

// Get list of notes
router.get("/list", getNotesList);

// Get note by id
router.get("/note/:id", loadNote);

export default router;