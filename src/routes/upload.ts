import express from "express";
import multer from "multer";
import fs from "fs";
import File from "../models/File";
import User from "../models/User";
import mongoose from "mongoose";

const upload = multer();
const router = express.Router();

async function createFile(file: Express.Multer.File, user: mongoose.Document, folder: string) {
    const dbFile = await File.create({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        user: user._id
    });

    let filepath = folder + dbFile._id;

    fs.writeFile(filepath, file.buffer, () => {
        console.log("wrote file:", file.originalname);
    });
}

router.post("/", upload.any(), async (req, res) => {
    if (!req.user) {
        res.end("Restricted");
        return;
    }

    const folder = process.cwd() + "/public/files/users/" + req.user.id + "/";

    // Create user file folder if it does not exist
    if (!fs.existsSync(folder))
        fs.mkdirSync(folder, {recursive: true});

    if (req.files) {
        if (Array.isArray(req.files)) {
            const promises: Promise<any>[] = [];

            // Create files
            req.files.forEach(file => {
                promises.push(createFile(file, req.user, folder));
            });

            // Wait for all files to finish writing
            await Promise.all(promises);
        }
    } else if (req.file) {
        await createFile(req.file, req.user, folder);
    }

    res.redirect("/");
});

export default router;