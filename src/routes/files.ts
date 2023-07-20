import express from "express";
import {upload} from "../util/upload";
import {upload as bbupload} from "../middleware/upload";
import * as filesCtrl from "../controllers/files";

const router = express.Router();

router.post("/test", bbupload(), (req, res, next) => {
    console.log(req.body);
    res.end("file uploaded!");
});

import {s3} from "../util/aws";
import {S3} from "aws-sdk";

async function getFile(url: string) {
    return new Promise<S3.GetObjectOutput>((resolve, reject) => {
        s3.getObject({Bucket: "opustrack", Key: url}, (err, data) => {
           if (err) {
               reject(err);
           }  else {
               resolve(data);
           }
        });
    });
}

router.get("/aws/:id", (req, res, next) => {
    s3.getObject({Bucket: "opustrack", Key: req.params["id"]}, (err, data) => {
        if (err) {
            if (err.name === "NoSuchKey") {
                res.json({success: false, message: "No file available"});
                return;
            }

            next(err);
            return;
        }
        if (!data.Body) {
            res.json({success: false, message: "No file available"});
            return;
        }

        console.log(data);

        res.end(data.Body);
    });
});

router.post("/upload", upload.single("file"), filesCtrl.create);
router.get("/:id", filesCtrl.show);

export default router;