import database from "./database";
import server from "./server";

// constants
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env["PORT"];

async function main() {
    await database.config();


    if (!PORT) {
        throw Error("main: missing PORT from .env file!");
    }

    server.listen(PORT, () => {
        console.log("Opus Track is listening at: http://localhost:" + PORT);
    });
}

main()
    .catch(err => {
        console.error(err);
        console.log("Server shutting down.");
    });
