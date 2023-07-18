import {Asset, AssetDocument, AssetType, ICredit} from "../models/Asset";
import {NextFunction, Request, Response} from "express";
import {File, FileDocument} from "../models/File";
import {UserDocument} from "../models/User";
import {createFile, deleteFile} from "./files";
import {render} from "../pages";

/**
 * Show one asset. Rendering depends on the filetype. For now only audio is implemented.
 * @routes GET /:userId/:id
 * @param req
 * @param res
 */
async function _show(req: Request, res: Response) {
    const asset: AssetDocument | null = await Asset.findById(req.params["id"]);
    if (!asset) {
        res.redirect("/error");
        return;
    }

    const file: FileDocument  = await asset.populate("file");
    console.log(file);
}

export async function deleteAsset(id: string) {

    // find asset from id
    let asset: AssetDocument | null = null;
    let error: any | null = null;
    try {
        asset = await Asset.findById(id);
    } catch(err) {
        error = err;
    }
    // error check
    if (!asset || error) {
        if (error) console.error(error);

        return false;
    }


    // delete associated file
    let result = false;
    try {
        result = await deleteFile(asset.file.toString());
    } catch(err) {
        error = err;
    }
    // error check
    if (!result || error) {
        if (error) console.error(error);

        return false;
    }


    // delete cover image file
    try {
        result = await deleteFile(asset.cover.toString());
    } catch(err) {
        error = err;
    }
    // error check
    if (!result || error) {
        console.warn(`Warning. Deleted Asset ${asset._id}, but could not delete its cover image.`);
        if (error)
            console.error(error);
        return false;
    }

    // delete asset document
    try {
        await Asset.deleteOne({_id: asset._id});
    } catch (err) {
        console.error(err);
        return false;
    }

    // success!
    return true;
}

export async function createAsset(
    type: AssetType, title: string, credits: ICredit[],
    file: Express.Multer.File, coverImage: Express.Multer.File | undefined, user: UserDocument) {

    const userFileFolder = process.cwd() + "/public/files/users/" + user._id + "/";
    const fileDoc = await createFile(file, user, userFileFolder);
    if (fileDoc === null) {
        return null;
    }

    let imageDoc: FileDocument | null = null;
    if (coverImage) {
        try {
            imageDoc = await createFile(coverImage, user, userFileFolder);
        } catch(err) {
            console.error(err);
            await deleteFile(fileDoc._id.toString());
            return null;
        }

    }

    const asset = new Asset({
        user: user._id,
        cover: imageDoc ? imageDoc._id : null,
        type: type,
        meta: {title, credits},
        file: fileDoc._id,
    });


    return await asset.save() || null;
}

async function _update(req: Request, res: Response, next: NextFunction) {
    const assetId = req.params["id"];
    if (!assetId) {
        next(new ReferenceError("Param :id was undefined."));
        return;
    }

    let asset: AssetDocument | null = null;
    try {
        asset = await Asset.findById(assetId);
    } catch(err) {
        next(err);
        return;
    }

    if (!asset) {
        next(new Error(`Asset with id ${assetId} does not exist.`));
        return;
    }

    // ensure the owning user is the one updating this asset!
    const user = req.user;
    if (!user || user._id !== asset.user) {
        if (!user) res.status(401); else res.status(403);

        next(new Error("Sorry, you do not have permission to view this content."));
        return;
    }

    // for unique metadata for various asset types in the future...
    // currently we are only supporting audio
    switch(asset.type) {
        case AssetType.Audio:
            break;
        default:
            next(new Error("Unknown or unimplemented asset type."));
            return;
    }

    // handle any new cover file and asset file
    if (req.files && Array.isArray(req.files)) {
        // delete cover file image if a new one is available
        let newCoverImageFile: Express.Multer.File | undefined;

        try {
            newCoverImageFile = req.files.find(file => file.fieldname === "coverImageUpload");
        } catch(err) {
            next(err);
            return;
        }

        if (newCoverImageFile) {

            // delete any existing cover image File
            if (asset.cover) {
                let result: boolean = false;
                try {
                    result = await deleteFile(asset.cover.toString());
                } catch(err) {
                    next(err);
                    return;
                }

                if (!result) {
                    // should we allow memory leak for good user exp?
                    next(new Error("Prevented overwrite, since original cover image could not be deleted."));
                    return;
                }
            }

            // create the new File doc in DB and on filesystem
            let newCoverImageFileDoc: FileDocument | null = null;
            try {
                newCoverImageFileDoc = await createFile(newCoverImageFile, user);
            } catch(err) {
                next(err);
                return;
            }

            if (newCoverImageFileDoc) {
                // success, commit changes
                asset.cover = newCoverImageFileDoc._id;
            } else {
                next(new Error("Failed to create new cover image file"));
                return;
            }
        }



        // handle any new asset file
        let newAssetFile: Express.Multer.File | undefined =
            req.files.find(file => file.fieldname === "assetFileUpload");

        if (newAssetFile) {
            // delete file to make room for new one
            let result = false;
            try {
                result = await deleteFile(asset.file.toString());
            } catch(err) {
                next(err);
                return;
            }

            if (!result) {
                next(new Error("Failed to delete pre-existing asset File"));
                return;
            }

            // create new File and save on filesystem
            let newAssetFileDoc: FileDocument | null;
            try {
                newAssetFileDoc = await createFile(newAssetFile, user);
            } catch(err) {
                next(err);
                return;
            }

            if (newAssetFileDoc) {
                asset.file = newAssetFileDoc._id;
            } else {
                next(new Error("Failed to create new asset File db document and file."));
                return;
            }
        }
    }

    // update metadata
    // collect credits
    const credits: ICredit[] = [];
    if (req.body["credit-name"] && req.body["credit-role"]) {
        if (Array.isArray(req.body["credit-name"]) &&  // array of credits passed from form
            Array.isArray(req.body["credit-role"])) {
            req.body["credit-name"].forEach( (creditName, i) => {
                credits.push({
                    name: creditName,
                    role: req.body["credit-role"][i],
                });
            });
        } else if (typeof req.body["credit-name"] === "string" &&  // single credit passed from form
            typeof req.body["credit-role"] === "string") {
                credits.push({
                    name: req.body["credit-name"],
                    role: req.body["credit-role"],
                });
        }
    }

    // not sure if this works? do we have to append?
    asset.meta.credits = credits;

    // set title
    asset.meta.title = req.body.title || asset.meta.title;


    try {
        await asset.save();
    } catch(err) {
        next(err);
        return;
    }

    const redirect = req.query["_redirect"];
    if (typeof redirect === "string")
        res.redirect(redirect);
    else
        res.redirect("/portfolio");
}

function _edit(req: Request, res: Response, next: NextFunction) {
    render("asset/edit", req, res);
}

async function _delete(req: Request, res: Response, next: NextFunction) {
    // ensure assetId exists
    const assetId = req.params["id"];
    if (!assetId) {
        next(ReferenceError("Param :id was undefined"));
        return;
    }

    // make sure asset exists
    let asset: AssetDocument | null;
    try {
        asset = await Asset.findById(assetId);
    } catch(err) {
        next(err);
        return;
    }

    if (!asset) {
        next(new ReferenceError("Asset with id: " + assetId + ", " +
            "does not exist in database."));
        return;
    }

    // make sure asset is owned by the user
    const user: UserDocument = req.user;
    if (!user) {
        next(new ReferenceError("User object was unexpectedly undefined."));
        return;
    }
    if (user._id !== asset.user._id) {
        res.status(403);
        next(new Error("Sorry, you are not allowed to access this content."));
        return;
    }

    // delete the asset
    let result: boolean = false;
    try {
        result = await deleteAsset(assetId);
    } catch(err) {
        next(err);
        return;
    }

    if (!result) {
        next(new Error("Failed to delete asset."));
        return;
    }

    const redirect = req.query["_redirect"];
    if (typeof redirect === "string")
        res.redirect(redirect);
    else
        res.redirect("/portfolio");
}


export default {
    edit: _edit,
    update: _update,
    delete: _delete,
}