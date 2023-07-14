import database from "./src/database";

import File from "./src/models/File";
import User from "./src/models/User";

const m = {
    File,
    User,
};

async function main() {

    // Set up mongoose
    try {
        await database.config();
    } catch(e) {
        if (e instanceof Error)
            console.error(e.message);
        throw e;
    }
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
