import {Router} from "express";
const router = Router();

import {render} from "../pages";
import {ServerError} from "../errors/ServerError";

router.get("/errortest", (req, res, next) => {
    next(new ServerError(500,  "Error Test!"));
});

router.get("/", (req, res) => {
    render("landing", req, res, {
        omitHeader: true
    });
});


export default router;
