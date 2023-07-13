import express from "express";
import multer from "multer";
import fs from "fs";

const upload = multer();
const router = express.Router();

router.post("/", upload.any(), (req, res) => {
    if (!req.user) {
        res.end("Restricted");
        return;
    }
    
    if (req.files) {
        if (Array.isArray(req.files)) {
            const folder = process.cwd() + "/public/files/users/" + req.user.id + "/";
            if (!fs.existsSync(folder))
                fs.mkdirSync(folder);

            console.log(folder);
            req.files.forEach(file => {
                let filepath = folder + file.originalname;
                if (fs.existsSync(filepath)) {
                    let i = 1;
                    while (fs.existsSync(filepath + " (" + i + ")"))
                        ++i;
                    filepath += " (" + i + ")";
                }

                fs.writeFile(filepath, file.buffer, () => {
                    console.log("wrote file:", folder + file.originalname);
                });
            });
        }

    }


    res.redirect("/");
});

export default router;