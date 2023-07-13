import database from "./database";
import server from "./server";
import {getEnv} from "./util";

const PORT = getEnv("PORT");

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
