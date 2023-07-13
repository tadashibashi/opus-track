import mongoose from "mongoose";
import {getEnv} from "./util";

async function config() {
    const mongoURI = getEnv("MONGO_URI");

    if (typeof mongoURI === "string") {
        await mongoose.connect(mongoURI);
        return mongoose;
    } else {
        throw Error("database.config: MONGO_URI not found in .env file!");
    }
}

export default {
    config,
}
