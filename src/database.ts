import mongoose from "mongoose";
const Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;
let gfs;

export async function config() {
    const mongoURI = process.env["MONGO_URI"];

    if (typeof mongoURI === "string") {
        await mongoose.connect(mongoURI);
        gfs = Grid(mongoose.connection.db);
    } else {
        throw Error("database.config: MONGO_URI not found in .env file!");
    }
}

export default {
    config,
    gfs,
};
