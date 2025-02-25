import express from "express";
import { createNote, getNotesList, loadNote } from "../controllers/noteController.js";

const router = express.Router();

// Handle note creation
router.post("/note/new", createNote);

// Handle note editing
router.post("/note/edit/:id", (req, res) => {
	// TODO: Render page for editing note
	return res.render("note", {
		title: "Edit Note",
		authenticated: true,
		id: req.params.id,
	});
});

// Get list of notes
router.get("/list", getNotesList);

// Get note by id
router.get("/note/:id", loadNote, (req, res) => {
	return res.render("note", {
		title: "Note",
		authenticated: true,
		id: req.params.id,
	});
});

export default router;