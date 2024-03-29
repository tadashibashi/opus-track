import {NextFunction, Request, Response} from "express";
import {render} from "../pages";
import User, {UserDocument} from "../models/User";
import File from "../models/File";
import {createFile} from "./files";
import {FileDocument} from "../models/File";
import fs from "fs";
import {getGfs} from "../util/upload";

async function _index(req: Request, res: Response, next: NextFunction) {

    try {
        const users = await User.find({}).populate("avatarFile").limit(24);
        render("browse", req, res, {
            locals: {users}
        });
    } catch(err) {
        next(err);
    }


}

async function _edit(req: Request, res: Response, next: NextFunction) {
    const user = req.user as UserDocument;
    if (!user) {
        next(new ReferenceError("User object is not available even though user was authorized"));
        return;
    }

    let avatarPath = user.avatar;
    if (user.avatarFile) {
        const avatarFile = await File.findById(user.avatarFile);

        if (avatarFile) {
            avatarPath = "/files/" + avatarFile.path;
        }
    }

    try {
        const locals = {
            avatarFile: avatarPath,
        };
        render("account/edit", req, res, {locals});
    } catch(err) {
        next(err);
    }
}

function _show(req: Request, res: Response, next: NextFunction) {

}

async function usernameIsUnique(username: string) {
    const users = await User.find({username});
    return !users.length;
}

const allowableMimeTypes = [
    "image/jpeg", "image/png"
];

async function _patch(req: Request, res: Response, next: NextFunction) {

    const user: UserDocument = req.user;
    if (!user) {
        next(new Error(`User was not found, though previously authenticated!`));
        return;
    }

    // check db if username is unique
    let username = req.body.username;
    if (typeof username === "string") {
        username = username.trim();
    }

    let displayName = req.body.displayName;
    if (typeof displayName === "string") {
        displayName = displayName.trim();
        user.displayName = displayName;
    }

    let isUniqueUsername: boolean = false;

    if (user.username !== username) {
        try {
            isUniqueUsername = await usernameIsUnique(username);
        } catch(err) {
            next(err);
            return;
        }

        if (!isUniqueUsername) {
            next(new Error(`Username ${username} was taken`));
            return;
        }
    }

    if (req.file && allowableMimeTypes.some(type => req.file!.mimetype === type)) {
        let fileDoc: FileDocument | null = null;
        //const folderPath = process.cwd() + "/public/files/users/" + user._id + "/";
        try {
            fileDoc = await createFile(req.file, user);
        } catch(err) {
            next(err);
        }
        if (!fileDoc) {
            next(new Error("Failed to create file for profile image."));
            return;
        }

        // delete existing profile pic file & database entry
        if (user.avatarFile) {
            try {
                const file = await File.findById(user.avatarFile);
                if (file) {
                    await getGfs().delete(file.fileId);
                }
            } catch(err) {
                await File.deleteOne(fileDoc._id);
                next(err);
                return;
            }
        }

        user.avatarFile = fileDoc._id;
    }

    user.username = username;

    try {
        await user.save({validateBeforeSave: true});
    } catch(err) {
        next(err);
        return;
    }
    res.redirect("/accounts/edit");
}

export default {
    edit: _edit,
    index: _index,
    patch: _patch,
}
