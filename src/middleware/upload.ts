import {Response, Request, NextFunction} from "express";
import busboy from "busboy";
import crypto from "crypto";
import {s3} from "../util/aws";

/**
 * This type appears inside req.body.files when uploadMultiple is placed before it
 */
export type FileInfo = busboy.FileInfo & { name: string };

function uploadMultiple() {
    return async function (req: Request, res: Response, next: NextFunction) {
        const infos: FileInfo[] = [];

        await new Promise((resolve, reject) => {
            const bb = busboy({headers: req.headers});
            bb.on("file", (name, file, info) => {
                s3.upload({
                    Bucket: "opustrack",
                    Body: file,
                    Key: crypto.randomBytes(20).toString("hex")
                });
                infos.push(Object.assign({name}, info));
            });

            bb.on("error", (err) => reject(err));
            bb.on("close", () => {
                req.body.files = infos;
                resolve(true);
            });
        }).catch(next);
    }
}