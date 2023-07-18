import {Router} from "express";
import userCtrl from "../controllers/user";
import {authorize} from "../middleware/authorize";
import {upload} from "../util/upload";

const router = Router();

router.get("/",
    userCtrl.index);

router.get("/edit",
    authorize(),
    userCtrl.edit);

router.patch("/",
    authorize(),
    upload.single("profilePic"),
    userCtrl.patch);

export default router;
