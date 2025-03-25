import express from "express";
import {registerUser, logoutUser, getProfile, saveProfile} from "../controllers/userController.js";
import passport from "passport";

const router = express.Router();

router.get("/signin", (req, res) => {
    if (req.authenticateSuccess) {
        console.log("[indexed.js] User already logged in");
        return res.redirect("/");
    }

    return res.render("signin", {
        title: "Sign in",
    });
});

router.post("/signin", 
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/signin",
    })
);

router.get("/register", (req, res) => {
    if (req.isAuthenticated()) {
        console.log("[index.js] User already logged in");
        return res.redirect("/");
    }

    return res.render("register", {
        title: "Register",
    });
});

router.post("/register", registerUser, (req, res) => {
    if (req.userExists) {
        // TODO: Handle if user already exists
        return res.render("register", {
            title: "Register",
            error: "User already exists",
        });
    }

    if (req.registerSuccess) {
        return res.redirect("/signin");
    } else {
        return res.render("register", {
            title: "Register",
            error: "Registration failed",
        });
        // TODO: Handle if user has failed to register
    }
});

router.get("/profile", getProfile);

router.post("/profile", saveProfile, (req, res) => {
    return res.redirect("/");
});

router.get("/logout", logoutUser, (req, res) => {
	return res.redirect("/");
});

export default router;
