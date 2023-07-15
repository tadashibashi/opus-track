import mongoose from "mongoose";
import {getEnv} from "./util";

async function config() {
    const mongoURI = getEnv("MONGO_URI");
    await mongoose.connect(mongoURI);
}

export default {
    config,
}
