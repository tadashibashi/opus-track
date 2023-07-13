import database from "./database";

async function main() {
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
    .then(any => console.log("Mongoose connection and Models initialized!"));
