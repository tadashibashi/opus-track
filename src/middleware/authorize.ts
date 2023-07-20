import {NextFunction, Request, Response} from "express";

type AuthorizeOptions = {failureRedirect?: string, successRedirect?: string};

export function authorize(opts: AuthorizeOptions = {failureRedirect: "/"}) {

    return function (req: Request, res: Response, next: NextFunction) {
        if (req.isAuthenticated()) {
            if (opts.successRedirect) {
                res.redirect(opts.successRedirect);
            }
            next();
        } else {
            if (opts.failureRedirect)
                res.redirect(opts.failureRedirect);
            res.redirect("/auth/google");
        }
    }
}
