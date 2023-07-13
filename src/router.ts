import { Router } from "express";
import indexRouter from "./routes/index";
import audioRouter from "./routes/audio";
import uploadRouter from "./routes/upload";

const router = Router();

router.use("/", indexRouter);
router.use("/audio", audioRouter);
router.use("/upload", uploadRouter);


export default router;
