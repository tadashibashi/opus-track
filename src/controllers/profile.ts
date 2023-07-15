import {Request, Response} from "express";
import {render} from "../pages";

import User from "../models/User";

function _index(req: Request, res: Response) {
    render("profile", req, res);
}

function _edit(req: Request, res: Response) {
    render("profile/edit", req, res);
}

async function usernameIsUnique(username: string) {
    const users = await User.find({username});
    return !!users.length;
}

async function _update(req: Request, res: Response) {
    // check db if username is unique
    const username = req.body.username;
    if (await usernameIsUnique(username)) {
        res.redirect("/profile");
    } else {
        res.redirect("/profile/edit");
    }



}

export default {
    edit: _edit,
    index: _index,
    update: _update,
}
