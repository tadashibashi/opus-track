import {Asset, AssetDocument, AssetType, ICredit} from "../models/Asset";
import {NextFunction, Request, Response} from "express";
import {File, FileDocument} from "../models/File";
import {UserDocument} from "../models/User";
import {createFile, deleteFile} from "./files";

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

    // find cover file and asset file
    if (req.files) {
        // delete cover file image if a new one is available

        // delete file if a new one is available
    }

    // update metadata
    // collect credits
    const credits: ICredit[] = [];

    // set title
    asset.meta.title = req.body.title || asset.meta.title;

}

export default {
    update: _update,
}