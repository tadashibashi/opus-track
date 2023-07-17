import {Router} from "express";
import profileCtrl from "../controllers/profile";
import {authorize} from "../middleware/authorize";
import multer from "multer";
const upload = multer();

const router = Router();

router.get("/",
    authorize(),
    profileCtrl.index);

router.get("/edit",
    authorize(),
    profileCtrl.edit);

router.patch("/",
    authorize(),
    upload.single("profilePic"),
    profileCtrl.patch);

export default router;
