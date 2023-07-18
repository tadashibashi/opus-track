import {NextFunction, Request, Response} from "express";
import Portfolio, {PortfolioDocument} from "../models/Portfolio";
import {createAsset, deleteAsset} from "./assets";
import {AssetDocument, AssetType, ICredit} from "../models/Asset";
import {UserDocument, User} from "../models/User";
import File from "../models/File";
import {render} from "../pages";


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

    res.redirect("/portfolio");
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

    res.redirect("/portfolio");
}


async function _createAsset(req: Request, res: Response, next: NextFunction) {
    // ensure user available
    const user = req.user;
    if (!user) {
        next(new ReferenceError("Internal error: user data was missing from the request"));
        return;
    }

    // ensure portfolio available
    // currently only supporting one global portfolio for the user...
    const portfolio = await Portfolio.findOne({owner: req.user._id});
    if (!portfolio) {
        next(new ReferenceError("Internal error: portfolio does not exist for user."));
        return;
    }

    // get credits
    const credits: ICredit[] = [];
    if (Array.isArray(req.body["credits-name"]) && Array.isArray(req.body["credits-role"])) {
        for (let i = 0; i < req.body["credits-name"].length; ++i) {
            credits.push({
                role: req.body["credits-role"][i],
                name: req.body["credits-name"][i],
            });
        }
    } else if (typeof req.body["credits-name"] === "string" && typeof(req.body["credits-role"] === "string")){
        credits.push({
            role: req.body["credits-role"],
            name: req.body["credits-name"],
        });
    } else {
        next(new ReferenceError("Credits were not available."));
        return;
    }

    // ensure files are available
    if (!req.files) {
        next(new ReferenceError("Files were not available."));
        return;
    }

    if (!Array.isArray(req.files)) {
        next(new TypeError("Files needs to be an array."));
        return;
    }

    // get files
    let coverImageFile = req.files.find(file => file.fieldname === "imageUpload");
    let audioFile = req.files.find(file => file.fieldname === "audioUpload");

    // ensure audioFile available
    if (!audioFile) {
        next(new ReferenceError("Audio file must be provided, but was undefined"));
        return;
    }

    // create the asset
    let asset: AssetDocument | null = null;
    try {
        asset = await createAsset(AssetType.Audio, req.body.title, credits, audioFile, coverImageFile, user);
    } catch (err) {
        next(err);
        return;
    }

    // ensure asset created
    if (!asset) {
        next(new ReferenceError("Asset failed to create!"));
        return;
    }

    // add to portfolio
    portfolio.assets.push(asset._id);

    try {
        await portfolio.save();
    } catch(err) {
        await deleteAsset(asset._id.toString());
        next(err);
        return;
    }

    res.redirect("/portfolio");
}


async function _addAsset(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        next(ReferenceError("User is not available even though authenticated!"));
        return;
    }

    const user = req.user as UserDocument;

    let portfolio: PortfolioDocument | null;
    try {
        portfolio = await Portfolio.findOne({owner: user._id});
    } catch(err) {
        next(err);
        return;
    }

    let avatarPath = user.avatar;
    if (user.avatarFile) {
        const avatarFile = await File.findById(user.avatarFile);

        if (avatarFile) {
            avatarPath = avatarFile.path;
        }
    }

    const locals = {
        portfolio,
        avatarPath,
    };

    render("portfolio/asset", req, res, {locals, css: ["/styles/audio-player.css"]});
}


async function _main(req: Request, res: Response, next: NextFunction) {
    const viewer = req.user;
    const ownerName = req.params.username;

    if (!ownerName) {
        next(new ReferenceError("Missing username param."));
        return;
    }

    let owner = await User.findOne({username: ownerName});
    if (!owner) {
        next(new ReferenceError("An artist by the name " + ownerName + " could not be found."));
        return;
    }

    let portfolio = await Portfolio.findOne({owner: owner._id});
    let populatedPortfolio: any;
    const coverArtSrcs: string[] = [];
    const assetFilePaths: string[] = [];
    if (portfolio) {
        const populated: PortfolioDocument & {assets: AssetDocument[]} = await portfolio.populate("assets");
        populatedPortfolio = populated;
        for (let i = 0; i < portfolio.assets.length; ++i) {
            const coverArtFile = await File.findById(populated.assets[i].cover);
            const assetFile = await File.findById(populated.assets[i].file);
            coverArtSrcs.push(coverArtFile ? "/files/" + coverArtFile.path : "");
            assetFilePaths.push(assetFile ? "/files/" + assetFile.path : "");
        }
    }

    owner = await owner.populate("avatarFile");

    const locals = {
        viewer,
        owner,
        coverArtSrcs,
        assetFilePaths,
        portfolio: populatedPortfolio // may be undefined, check and let user know in template
    };

    render("portfolio", req, res, {
        locals,
        css: ["/styles/audio-player.css", "/styles/audio-player-mini.css"],
    });
}

function _index(req: Request, res: Response, next: NextFunction) {
    const user: UserDocument | undefined = req.user;
    if (!user) {
        next(new ReferenceError("Missing user object"));
        return;
    }

    res.redirect("portfolio/a/" + user.username);
}

export default {
    main: _main,
    index: _index,
    addAsset: _addAsset,
    create: _create,
    delete: _delete,
    createAsset: _createAsset,
}
