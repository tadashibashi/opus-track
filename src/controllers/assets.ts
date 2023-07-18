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
    if (!user || user._id.toString() !== asset.user.toString()) {

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
    if (req.body["credits-name"] && req.body["credits-role"]) {
        if (Array.isArray(req.body["credits-name"]) &&  // array of credits passed from form
            Array.isArray(req.body["credits-role"])) {
            req.body["credits-name"].forEach( (creditName, i) => {
                credits.push({
                    name: creditName,
                    role: req.body["credits-role"][i],
                });
            });
        } else if (typeof req.body["credits-name"] === "string" &&  // single credit passed from form
            typeof req.body["credits-role"] === "string") {
                credits.push({
                    name: req.body["credits-name"],
                    role: req.body["credits-role"],
                });
        }
    }


    // need to append credits, cannot assign directly
    asset.meta.credits = [];
    credits.forEach(credit => {
        asset!.meta.credits.push(credit);
    });

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


// Gets cover image for an asset.
// Assumes user._id and asset.user._id point to the same document.
export async function getCoverFilePath(asset: AssetDocument, user: UserDocument) {
    // Get cover file path
    // hmmm it's kind of convoluted to get the album image, we should sum it up in a function
    let coverFilePath: string | null = null;
    try {
        const coverFile = await File.findById(asset.cover);
        if (coverFile)
            coverFilePath = coverFile.path;
    } catch(err) {
        console.error(err);
        return null;
    }

    if (!coverFilePath) {
        let avatarPath: string;
        if (user.avatarFile) {
            try {
                user = await user.populate("avatarFile");
                avatarPath = (user as UserDocument & {avatarFile: FileDocument}).avatarFile.path;
            } catch(err) {
                console.error(err);
                return null;
            }
        } else {
            avatarPath = user.avatar;
        }
        coverFilePath = avatarPath;
    }

    return coverFilePath;
}


async function _edit(req: Request, res: Response, next: NextFunction) {
    // get asset id
    const assetId = req.params["id"];
    if (!assetId) {
        next(new ReferenceError("Param :id was undefined"));
        return;
    }

    // get asset doc from database
    let asset: AssetDocument | null = null;
    try {
        asset = await Asset.findById(assetId);
    } catch(err) {
        next(err);
        return;
    }

    if (!asset) {
        next(new Error("Asset document was not found in database"));
        return;
    }

    // ensure that user exists
    let user: UserDocument = req.user;
    if (!user) {
        next(new ReferenceError("User object was unexpectedly undefined"));
        return;
    }

    // ensure that the user is the asset owner
    if (user._id.toString() !== asset.user._id.toString()) {
        res.status(403);
        next(new Error("Sorry, you do not have permission to view this content"));
        return;
    }


    // get cover art file path
    let coverFilePath: string | null;
    try {
        coverFilePath = await getCoverFilePath(asset, user);
    } catch(err) {
        next(err);
        return;
    }

    if (!coverFilePath) {
        next(new Error("Could not get the cover file path"));
        return;
    }

    // get asset file path
    let assetFilePath: string | null = null;
    try {
        const assetFile: FileDocument | null = await File.findById(asset.file);
        if (assetFile) {
            assetFilePath = assetFile.path;
        }
    } catch(err) {
        next(err);
        return;
    }

    if (!assetFilePath) {
        next(new Error("Failed to get asset file path"));
        return;
    }


    // Set the editor view depending on file type
    let viewPath = "asset/edit/";
    let css: string[] = [];
    switch(asset.type) {
        case AssetType.Audio:
            viewPath += "audio";
            css.push("/styles/audio-player.css");
            break;
        default:
            next(new Error("Asset types besides audio are currently unsupported"));
            break;
    }

    render(viewPath, req, res, {
        locals: {
            asset,
            user,
            coverFilePath,
            assetFilePath,
        },
        css,
    });
}

async function _delete(req: Request, res: Response, next: NextFunction) {
    // ensure assetId exists
    const assetId = req.params["id"];
    if (!assetId) {
        next(new ReferenceError("Param :id was undefined"));
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
        next(new Error("Sorry, you do not have permission to view this content."));
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