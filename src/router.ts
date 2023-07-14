import { Router } from "express";
import indexRouter from "./routes/index";
import audioRouter from "./routes/audio";
import filesRouter from "./routes/files";

const router = Router();

router.use("/", indexRouter);
router.use("/audio", audioRouter);
router.use("/files", filesRouter);


export default router;
