import mongoose from "mongoose";
const Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;
let gfs: any; // no types for this lib :/

async function config() {
    const mongoURI = process.env["MONGO_URI"];

    if (typeof mongoURI === "string") {
        await mongoose.connect(mongoURI);
        gfs = Grid(mongoose.connection.db);
    } else {
        throw Error("database.config: MONGO_URI not found in .env file!");
    }
}

function getGfs() {
    return gfs;
}

export default {
    config,
    getGfs,
};
