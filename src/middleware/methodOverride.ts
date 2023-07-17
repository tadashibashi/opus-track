import {Request, Response, NextFunction} from "express";

/**
 * Middleware looks for a query param specified by methodName, and sets the
 * request method to the value of that param.
 * @param methodName - name of the query param to look for
 */
export default function methodOverride(methodName: string = "_method") {
    return function(req: Request, res: Response, next: NextFunction) {
        let method = req.query[methodName];
        if (typeof method === "string") {
            method = method.toUpperCase();

            switch(method) {
                case "GET":
                case "HEAD":
                case "POST":
                case "PUT":
                case "DELETE":
                case "CONNECT":
                case "OPTIONS":
                case "TRACE":
                case "PATCH":
                    req.method = method;
                    break;
                default:
                    next(new Error(`Request method \"${method}\" was not valid.`));
                    return;
            }
        }

        next();
    };
}
