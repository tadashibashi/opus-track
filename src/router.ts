// master router
import { Router } from "express";
const router = Router();

import * as pages from "./pages";

pages.init("Opus Track");

// sub-routers
import authRouter from "./routes/auth";
import indexRouter from "./routes/index";
import tracksRouter from "./routes/tracks";
import filesRouter from "./routes/files";
import profileRouter from "./routes/profile";
import portfolioRouter from "./routes/portfolio";
import errorRouter from "./routes/error";

// mount routers
router.use("/", indexRouter);
router.use("/auth", authRouter);
router.use("/files", filesRouter);
router.use("/tracks", tracksRouter);
router.use("/profile", profileRouter);
router.use("/portfolio", portfolioRouter);
router.use("/", errorRouter);

export default router;
