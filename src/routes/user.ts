import {Router} from "express";
import userCtrl from "../controllers/user";
import {authorize} from "../middleware/authorize";
import multer from "multer";
const upload = multer();

const router = Router();

router.get("/",
    authorize(),
    userCtrl.index);

router.get("/edit",
    authorize(),
    userCtrl.edit);

router.patch("/",
    authorize(),
    upload.single("profilePic"),
    userCtrl.patch);

export default router;
