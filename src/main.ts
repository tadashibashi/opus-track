import database from "./database";

// constants
import dotenv from "dotenv";
dotenv.config();

import server from "./server";



const PORT = process.env["PORT"];

async function main() {
    if (!PORT) {
        throw Error("main: missing PORT from .env file!");
    }

    server.listen(PORT, () => {
        console.log("Opus Track is listening at: http://localhost:" + PORT);
    });

    await database.config();
}

main()
    .catch(err => {
        console.error(err);
        console.log("Server shutting down.");
    });
