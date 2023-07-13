/**
 * Boilerplate code from: https://www.labnol.org/google-drive-api-upload-220412
 */
import stream from "stream";
import express from "express";
import multer from "multer";
import {google, Common} from "googleapis";
import {authenticate} from "@google-cloud/local-auth";
import * as path from "path";
import fs from "fs";
import passport from "passport";

const router = express.Router();
const uploadUnused = multer();

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    keyFile: CREDENTIALS_PATH,
});
/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
function loadSavedCredentialsIfExist() {
    try {
        const content = fs.readFileSync(TOKEN_PATH, {encoding: "utf-8"});
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client: Common.OAuth2Client) {
    const content = await fs.readFileSync(CREDENTIALS_PATH);
    const keys = JSON.parse(content.toString());
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    fs.writeFileSync(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */


const uploadFile = async (fileObj: Express.Multer.File) => {
    const buffer = new stream.PassThrough();
    buffer.end(fileObj.buffer);



    const {data} = await google.drive({version: "v3", auth: auth}).files.create({
        media: {
            mimeType: fileObj.mimetype,
            body: buffer
        },
        requestBody: {
            name: fileObj.originalname,
            parents: ["1if2y4YAE_2jVAKlBLNFKTdMI5IY63-oc"],
        },
        fields: "id,name",
    });
    console.log("Uploaded file " + data.name + " " + data.id);
}

router.post("/", uploadUnused.any(), async (req, res) => {
    try {
        const {body, files} = req;

        const promises: Promise<any>[] = [];

        if (files) {
            if (Array.isArray(files)) {
                for (let i = 0; i < files.length; ++i) {
                    promises.push(uploadFile(files[i]));
                }
            } else if (typeof files === "object") {
                Object.keys(files).forEach(key => {
                    files[key].forEach(file => promises.push(uploadFile(file)));
                });
            }
        }
        console.log(files);

        await Promise.all(promises);
        console.log(files);
        console.log(body);
        res.status(200).send("Form submitted");

        res.redirect("/");
    } catch (err) {
        if (err instanceof Error) {
            console.error(err);
        }
    }
});

export default router;
