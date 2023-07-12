import { Router } from "express";

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

export default router;
