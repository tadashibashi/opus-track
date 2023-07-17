import {NextFunction, Request, Response} from "express";
import Portfolio, {PortfolioDocument} from "../models/Portfolio";
import {createAsset} from "./assets";

async function _create(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        next(new ReferenceError("User object does not exist even though authorized."));
        return;
    }

    try {
        await Portfolio.create({
            assets: [],
            owner: req.user,
        });
    } catch(err) {
        next(err);
        return;
    }

    res.redirect("/profile");
}

async function _delete(req: Request, res: Response, next: NextFunction) {
    // ensure user object exists
    if (!req.user) {
        next(new ReferenceError("User object does not exist even though authorized."));
        return;
    }

    // ensure we've retrieved the Portfolio id to delete
    const portfolioId = req.params["id"]
    if (!portfolioId) {
        next(new ReferenceError("Could not delete Portfolio because the id was undefined."));
        return;
    }

    // get portfolio from database
    let portfolio: PortfolioDocument | null;
    try {
        portfolio = await Portfolio.findOne({_id: portfolioId});
    } catch(err) {
        next(err);
        return;
    }

    // check it exists
    if (!portfolio) {
        next(new ReferenceError(`Could not delete Portfolio ${portfolioId} because it does not exist in database.`));
        return;
    }

    // check if user is authorized
    if (portfolio.owner !== req.user._id) {
        next(new Error("User is not authorized to delete this Portfolio."));
        return;
    }

    // delete the portfolio
    try {
        await Portfolio.deleteOne({_id: portfolio._id});
    } catch(err) {
        next(err);
        return;
    }

    res.redirect("/profile");
}

async function _createAsset(req: Request, res: Response, next: NextFunction) {
    //createAsset()

    console.dir(req.body);

    res.redirect("/profile");
}

export default {
    create: _create,
    delete: _delete,
    createAsset: _createAsset,
}