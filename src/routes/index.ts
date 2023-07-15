import {Request, Response, Router} from "express";
import passport from "passport";

const router = Router();


interface PartialInfo {
    partial: string;
    locals: any;
}

interface PageLocals {
    __vars: {
        title: string;
        header: PartialInfo;
        footer: PartialInfo;
        main: PartialInfo[];
        user: passport.Profile;
    }
}

function renderPage(req: Request, res: Response, page: string) {

    res.render("driver");
}

router.get("/", (req, res) => {
    res.locals.vars = {
        page: "title",
        title: "Opus Track",
        // header: {
        //     partial: "partials/header",
        //     vars: {},
        // },
        // footer: {
        //     partial: "partials/footer",
        //     vars: {},
        // },
        main: [{partial: "pages/landing"}, { partial: "partials/partial1"}, {partial: "partials/partial2"}],
        user: req.user,
        css: ["/styles/pages/landing.css"]
    };

    res.render("driver");
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
         res.redirect("/home");
     });
});

router.get("/home", (req, res) => {
    res.locals.vars = {
        page: "title",
        title: "Opus Track",
        subtitle: "Home",
        // header: {
        //     partial: "partials/header",
        //     vars: {},
        // },
        // footer: {
        //     partial: "partials/footer",
        //     vars: {},
        // },
        main: [{partial: "partials/partial2"}],
        user: req.user,
    };

    res.render("driver");
    res.render("driver");
});

export default router;
