import {Request, Response} from "express";

import fs from "fs";
import {getEnv, scanner} from "../util";
import {UserDocument} from "../models/User";
import {FileDocument, File} from "../models/File";
import path from "path";


scanner.config()
    .catch(err => console.error(err));


class FileInfectedError extends Error {
    get message() {
        return "FileInfectedError: infected or suspicious file.";
    }
}

export async function deleteFile(id: string) {
    const file = await File.findById(id);
    if (!file)
        return false;

    let result = false;
    try {
        result = await new Promise((resolve, reject) => {
            fs.rm(file.fullpath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    } catch(err) {
        return false;
    }

    if (!result)
        return false;

    try {
        await File.deleteOne({_id: file._id});
    } catch(err) {
        console.error("Successfully deleted actual file, but not the File metadata in the DB!");
        return false;
    }

    return true;
}


/**
 * Creates a file in db and local file system.
 * @param file - the file retrieved from Multer.
 * @param user - user that the File will become associated with.
 * @param folder - will save to this exact folder on server.
 * Make sure to set to something like: `process.cwd() + "/public/files/users/"`.
 * @returns promise resolving to true on successful file write, and false on failure to write.
 * On failure, both database data and local file are cleaned up if any was written.
 */
export async function createFile(file: Express.Multer.File, user: UserDocument, folder: string) {
    const result = (getEnv("NODE_ENV") === "development") ? // TODO: workaround for class project, make sure to actually import clamd into the environment for production!!!
        await scanner.scanFile(file.buffer) : {isInfected: false};

    if (result.isInfected) {
        console.error("[upload.createFile]: infected file:", file.originalname,
            "uploaded by user", `${user.firstName} ${user.lastName}: ${user._id}`);
        throw new FileInfectedError();
    }

    let dbFile: FileDocument | null = new File ({
        filename: file.originalname,
        folder: "/",
        mimetype: file.mimetype,
        size: file.size,
        user: user._id,
    });


    if (dbFile === null) return null;

    const ext = path.extname(file.originalname);
    let filepath = folder + dbFile._id + ext;
    dbFile.path = "/files/" + (user ? "users/" + user._id : "") + "/" + dbFile._id + ext;
    dbFile.fullpath = filepath;
    try {
        fs.writeFile(filepath, file.buffer, () => {
            console.log("wrote file:", file.originalname + ", at " + filepath);
        });

    } catch(err) {
        if (err instanceof Error)
            console.error(`failed to write file ${file.originalname}:`, err.message);
        return null;
    }

    try {
        await dbFile.save();
    } catch(err) {
        if (err instanceof Error)
            console.error(`failed to write file ${file.originalname}, could not save object to the database`, err.message);
        fs.rm(filepath, () => console.log("removing corresponding file from fs"));
        return null;
    }

    return dbFile;
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
        } catch(err) {
            if (err instanceof FileInfectedError) {
                req.user.infectedFileCount = !req.user.infectedFileCount ? 1 : req.user.infectedFileCount + 1;
                req.user.save();
            }
        }
    }

    res.redirect("/");
}
