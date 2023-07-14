import {Request, Response} from "express";

import fs from "fs";
import {scanner} from "../util";
import {UserDocument} from "../models/User";
import {FileDocument, File} from "../models/File";


scanner.config()
    .catch(err => console.error(err));


class FileInfectedError extends Error {
    get message() {
        return "FileInfectedError: infected or suspicious file.";
    }
}


/**
 * Creates a file in db and local file system.
 * @param file
 * @param user
 * @param folder
 * @returns promise resolving to true on successful file write, and false on failure to write.
 * On failure, both database data and local file are cleaned up if any was written.
 */
async function createFile(file: Express.Multer.File, user: UserDocument, folder: string) {
    const result = await scanner.scanFile(file.buffer);
    if (result.isInfected) {
        console.error("[upload.createFile]: infected file:", file.originalname, "uploaded by user",
            `${user.firstName} ${user.lastName}: ${user._id}`);
        throw new FileInfectedError();
    }

    let dbFile: FileDocument | null = null;
    try {
        dbFile = await File.create({
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            user: user._id
        });
    } catch(e) {
        if (e instanceof Error)
            console.error(e.message);
        console.error("failed to create File metadata in db");
        return false;
    }

    if (dbFile === null) return false;

    let filepath = folder + dbFile._id;
    try {
        fs.writeFile(filepath, file.buffer, () => {
            console.log("wrote file:", file.originalname);
        });

    } catch(e) {
        if (e instanceof Error)
            console.error(`failed to write file ${file.originalname}:`, e.message);
        await File.deleteOne({_id: dbFile._id});
        console.error("deleted corresponding db metadata");
        return false;
    }

    return true;
}

export
async function show(req: Request, res: Response) {
    const fileId = req.query["id"];

    const file = await File.findById(fileId);
}

export
async function create(req: Request, res: Response) {
    if (!req.user) {
        res.end("Restricted");
        return;
    }

    const folder = process.cwd() + "/public/files/users/" + req.user.id + "/";

    // Create user file folder if it does not exist
    if (!fs.existsSync(folder))
        fs.mkdirSync(folder, {recursive: true});

    // Multiple files passed by user for upload
    if (req.files) {
        if (Array.isArray(req.files)) {
            const promises: Promise<any>[] = [];

            // Create files
            req.files.forEach(file => {
                promises.push(createFile(file, req.user, folder));
            });

            try {
                // Wait for all files to finish writing
                await Promise.all(promises);
            } catch(e) {
                if (e instanceof FileInfectedError) {
                    req.user.infectedFileCount = !req.user.infectedFileCount ? 1 : req.user.infectedFileCount + 1;
                    req.user.save();
                }
            }
        }
    } else if (req.file) {
        // single file passed by user for upload

        try {
            await createFile(req.file, req.user, folder);
        } catch(e) {
            if (e instanceof FileInfectedError) {
                req.user.infectedFileCount = !req.user.infectedFileCount ? 1 : req.user.infectedFileCount + 1;
                req.user.save();
            }
        }
    }

    res.redirect("/");
}
