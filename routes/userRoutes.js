import express from "express";
import {loginUser, registerUser, logoutUser, getProfile, saveProfile} from "../controllers/userController.js";

const router = express.Router();

router.get("/signin", (req, res) => {
    // Sign in page temporarily disabled
    return res.redirect("/");
});

router.post("/signin", (req, res) => {
    // Login is temporarily disabled
    return res.redirect("/");
});

router.get("/register", (req, res) => {
    // Registration temporarily disabled
    return res.redirect("/");
});

router.post("/register", (req, res) => {
    // Registration is temporarily disabled
    return res.redirect("/");
});

router.get("/profile", (req, res) => {
    // Profile access disabled while DB is offline
    return res.redirect("/");
});

router.post("/profile", (req, res) => {
    // Saving profile disabled while DB is offline
    return res.redirect("/");
});

router.get("/logout", logoutUser, (req, res) => {
	return res.redirect("/");
});

export default router;
