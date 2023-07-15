import {Router} from "express";
const router = Router();

import {render} from "../pages";

// user home. TODO: add to user route?
router.get("/home", (req, res) => {
    res.render("driver");
});


router.get("/", (req, res) => {
    render("landing", req, res, {
        omitHeader: true
    });
});


export default router;
