import { Router } from "express";
import audioRouter from "./routes/audio";

const router = Router();

router.get("/", (req, res) => {
    res.end("Hello World!");
});

router.use("/audio", audioRouter);

export default router;
