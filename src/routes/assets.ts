import {Router} from "express";
import {upload} from "../util/upload";
import assetsCtrl from "../controllers/assets";
import {authorize} from "../middleware/authorize";

const router = Router();


/// show one asset to the user
/// @param :id asset id
/// renders a view
//router.get("/:id", assetsCtrl.show);

/// show the editor tools to make a put request
/// @param :id asset id
/// renders a view depending on asset type - for now, only audio.
router.get("/:id/edit", authorize(), assetsCtrl.edit);

/// update an asset
/// @param :id asset id
/// @query _redirect will send the page to this address, otherwise it will return to /portfolio
/// 0 means no errors, anything else means there's an error
router.put("/:id", authorize(), upload.any(), assetsCtrl.update);

/// delete an asset
/// @param :id asset id
/// @query _redirect will send the page to this address, otherwise it will return to /portfolio
/// 0 means no errors, anything else means there's an error
router.delete("/:id", authorize(), assetsCtrl.delete);

export default router;
