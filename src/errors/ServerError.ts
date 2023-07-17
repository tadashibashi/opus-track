export class ServerError extends Error {
    statusCode: number;

    constructor(statusCode: number = 500, message: string = "") {
        super(message);
        this.name = "Server Error";
        this.statusCode = statusCode;
    }
}
