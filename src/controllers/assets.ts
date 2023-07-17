import {Asset, AssetDocument, AssetType, ICredit} from "../models/Asset";
import {NextFunction, Request, Response} from "express";
import {File, FileDocument} from "../models/File";
import {UserDocument} from "../models/User";
import {createFile} from "./files";

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

export async function createAsset(
    type: AssetType, title: string, credits: ICredit[],
    file: Express.Multer.File, user: UserDocument) {

    const fileDoc = await createFile(file, user, process.cwd() + "/public/files/users/" + user._id + "/");
    if (fileDoc === null) {
        return null;
    }

    const asset = new Asset({
        user: user._id,
        type: type,
        meta: {title, credits},
        file: fileDoc._id,
    });

    if (fileDoc)
    await asset.save();

}
