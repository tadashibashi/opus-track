import express from "express";
import multer from "multer";
import * as filesCtrl from "../controllers/files";

const upload = multer();
const router = express.Router();


router.post("/upload", upload.single("file"), filesCtrl.create);
router.get("/:id", filesCtrl.show);

export default router;