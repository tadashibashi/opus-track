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
            console.error(e);
        throw e;
    }
}

main()
    .catch(err => console.error("Critical error: program shutting down."))
    .then(any => {
        console.log("Mongoose connection and Models initialized!")
        console.log(m);
    });
