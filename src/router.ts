// master router
import { Router } from "express";
const router = Router();

import * as pages from "./pages";

pages.init("Opus Track");

// sub-routers
import authRouter from "./routes/auth";
import indexRouter from "./routes/index";
import filesRouter from "./routes/files";
import accountRouter from "./routes/user";
import portfolioRouter from "./routes/portfolio";
import errorRouter from "./routes/error";

// mount routers
router.use("/", indexRouter);
router.use("/auth", authRouter);
router.use("/files", filesRouter);
router.use("/account", accountRouter);
router.use("/portfolio", portfolioRouter);
router.use("/", errorRouter);

export default router;
