import multer from "multer";
import {GridFsStorage} from "multer-gridfs-storage";
import getEnv from "./getEnv";
import {Request} from "express";
import crypto from "crypto"
import path from "path";

const storage = new GridFsStorage({
    url: getEnv("MONGO_URI"),
    file: (req: Request, file: Express.Multer.File) => {

        return new Promise((resolve, reject) => {
            const user: UserDocument | undefined = req.user;
            if (!user)
                reject(new ReferenceError("User was unexpectedly undefined"));
            crypto.randomBytes(16, (err, buf) => {
                if (err)
                    return reject(err);
                const filename = user!._id.toString() + "-" + buf.toString("hex") + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads",
                };
                resolve(fileInfo);
            });
        });
    }
});

export const upload: multer.Multer = multer({storage});

import mongoose from "mongoose";
import {UserDocument} from "../models/User";
let gfs: mongoose.mongo.GridFSBucket | null = null;

/**
 * Get grid fs object. Make sure mongodb connection has already been made.
 */
export function getGfs() {
    if (!gfs) {
        gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: "uploads",
        });
    }

    return gfs;
}
