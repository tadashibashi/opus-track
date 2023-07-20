import {Response, Request, NextFunction} from "express";
import busboy from "busboy";
import crypto from "crypto";
import {s3} from "../util/aws";
import path from "path";

/**
 * This type appears inside req.body.files when upload is placed before it
 */
export type FileInfo = busboy.FileInfo & { name: string };

interface UploadConfig {
    // Permissible mimetypes. Left unspecified will allow any type to upload.
    mimeTypes?: string[],
}

export function upload(config?: UploadConfig) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const infos: FileInfo[] = [];

        await new Promise((resolve, reject) => {
            const bb = busboy({headers: req.headers});

            bb.on("file", (name, file, info) => {
                // guard against undesired mimeTypes
                if (config && config.mimeTypes && !config.mimeTypes.includes(info.mimeType))
                    return;

                // upload to s3
                s3.upload({
                    Bucket: "opustrack",
                    Body: file,

                    Key: crypto.randomBytes(20).toString("hex") + path.extname(info.filename || ""),
                }).send((err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log("uploaded data: ", data);
                        infos.push(Object.assign({name}, info));
                    }
                });

            })
            .on("error", (err) => reject(err))
            .on("close", () => {
                req.body.files = infos;
                console.log("Busboy finished parsing form.");
                resolve(true);
            });

            req.pipe(bb);
        })
        .then(() => next())
        .catch(next)

    }
}