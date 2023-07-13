import mongoose from "mongoose";

async function config() {
    const mongoURI = process.env["MONGO_URI"];

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
