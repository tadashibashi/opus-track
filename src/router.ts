import { Router } from "express";
import audioRouter from "./routes/audio";

const router = Router();

router.get("/", (req, res) => {
    res.render("index", {
        title: "Hello!",
        css: ["/styles/styles.css"],
    });
});

router.post("/clicked", (req, res) => {
   res.render("index", {
      title: "hello!!!!",
      css: ["/styles/styles.css"],
   });
});

router.use("/audio", audioRouter);

export default router;
