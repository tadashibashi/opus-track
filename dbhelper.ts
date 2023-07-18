import database from "./src/database";

import File from "./src/models/File";
import User from "./src/models/User";
import Asset from "./src/models/Asset";
import Portfolio from "./src/models/Portfolio";
import {getGfs} from "./src/util/upload";
import mongoose from "mongoose";

const m = {
    File,
    User,
};
let gfs: mongoose.mongo.GridFSBucket | null = null;
async function main() {

    // Set up mongoose
    try {
        await database.config();
    } catch(e) {
        if (e instanceof Error)
            console.error(e.message);
        throw e;
    }
    gfs = getGfs();
}

main()
    .catch(err => {
        console.error("Critical error: program shutting down.")
        if (!(err instanceof Error))
            console.error("Uncaught exception:", err);
    })
    .then(any => {
        console.log("Mongoose connection and Models initialized!")
        console.log(m);
    });
