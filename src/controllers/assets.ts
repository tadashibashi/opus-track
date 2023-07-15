import {Asset, AssetDocument} from "../models/Asset";
import {Request, Response} from "express";
import {FileDocument} from "../models/File";

/**
 * Show one asset. Rendering depends on the filetype. For now only audio is implemented.
 * @routes GET /:userId/:id
 * @param req
 * @param res
 */
async function show(req: Request, res: Response) {
    const asset: AssetDocument | null = await Asset.findById(req.params["id"]);
    if (!asset) {
        res.redirect("/error");
        return;
    }

    const file: FileDocument  = await asset.populate("file");
    console.log(file);
}
