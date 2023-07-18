import express from "express";
import {upload} from "../util/upload";
import * as filesCtrl from "../controllers/files";

const router = express.Router();


router.post("/upload", upload.single("file"), filesCtrl.create);
router.get("/:id", filesCtrl.show);

export default router;