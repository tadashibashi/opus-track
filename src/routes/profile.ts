import {Router} from "express";
import profileCtrl from "../controllers/profile";
import {authorize} from "../middleware/authorize";

const router = Router();

router.get("/",
    authorize({failureRedirect: "/"}),
    profileCtrl.index);

router.get("/edit",
    authorize({failureRedirect: "/"}),
    profileCtrl.edit);

router.patch("/update",
    authorize({failureRedirect: "/"}),
    profileCtrl.update);

export default router;