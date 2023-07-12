import { Router } from "express";
import indexRouter from "./routes/index";
import audioRouter from "./routes/audio";

const router = Router();

router.use("/index", indexRouter);
router.use("/audio", audioRouter);

export default router;
