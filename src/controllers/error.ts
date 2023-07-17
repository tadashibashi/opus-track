import {NextFunction, Request, Response} from "express";
import {render} from "../pages";
import {getEnv} from "../util";
import {ServerError} from "../errors/ServerError";

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ServerError) {
        res.statusCode = err.statusCode;
    } else {
        res.statusCode = 500;
    }

    render("error", req, res, {
        locals: {
            error: err,
            statusCode: res.statusCode,
            isDevelopment: getEnv("NODE_ENV")  === "development",
        },
    })
}

function notFound(req: Request, res: Response, next: NextFunction) {
    next(new ServerError(404, `URL path at ${req.originalUrl} could not be found.`));
}

export default {
    notFound,
    errorHandler,
}
