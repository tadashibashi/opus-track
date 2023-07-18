import {Router} from "express";
import multer from "multer";
import assetsCtrl from "../controllers/assets";

const router = Router();

/// show one asset to the user
/// @param :id asset id
/// renders a view
router.get("/:id", assetsCtrl.show);

/// show the editor tools to make a put request
/// @param :id asset id
/// renders a view depending on asset type - for now, only audio.
router.get("/:id/edit", assetsCtrl.edit);

/// update an asset, return error code
/// @param :id asset id
/// @query _redirect will send the page to this address, otherwise it will return to /portfolio
/// 0 means no errors, anything else means there's an error
router.put("/:id", assetsCtrl.update);

/// delete an asset, return json error code
/// @param :id asset id
/// @returns {result: number, message: string}
/// 0 means no errors, anything else means there's an error
router.delete("/:id", assetsCtrl.delete);
