// ===== Router ===============================================================
import {Router} from "express";
const router = Router();

router.get("/", _index);

export default router;

// ===== Controller ===========================================================
import {Request, Response, NextFunction} from "express";

async function _index(req: Request, res: Response) {
    res.end("AUDIO: respond with resource...");
}

async function _create(req: Request, res: Response) {

}
