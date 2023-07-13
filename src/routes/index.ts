import { Router } from "express";
import passport from "passport";

const router = Router();

router.get("/", (req, res) => {
    res.render("index", {
        title: "Hello!",
        css: ["/styles/styles.css"],
    });
});

router.post("/clicked", (req, res) => {
    res.end("hello!");
});

// Google OAuth2 Routes

router.get("/auth/google", passport.authenticate("google", {
    // request user's profile and email from Google OAuth service
    scope: ["profile", "email"],
    // Optionally force pick account every time
    // prompt: "select_account"
}));

// Google callback route

router.get("/auth/google/oauth2callback", passport.authenticate("google", {
    successRedirect: "/",
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
