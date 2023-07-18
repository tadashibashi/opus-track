import {Router} from "express";
import passport from "passport";

const router = Router();


// Get Authorization from Google
router.get("/google", passport.authenticate("google", {
    // request user's profile and email from Google OAuth service
    scope: ["profile", "email"],
    // Optionally force pick account every time
    // prompt: "select_account"
}));


// Google callback route
router.get("/google/oauth2callback", passport.authenticate("google", {
    successRedirect: "/portfolio", // change this later
    failureRedirect: "/",
}));


// Logout
router.get("/logout", (req, res) => {
    // @ts-ignore
    req.logout(() => {
        res.redirect("/");
    });
});

export default router;
