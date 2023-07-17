import {Router} from "express";
import errorCtrl from "../controllers/error";

const router = Router();

// 404 not found
router.get("*", errorCtrl.notFound);


export default router;