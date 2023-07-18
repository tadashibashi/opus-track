import {Router} from "express";
import portfolioCtrl from "../controllers/portfolio";
import {authorize} from "../middleware/authorize";
import Multer from "multer";
const upload = Multer();

const router = Router();

// main portfolio view page in user portal, reroutes to your personal page
router.get("/", authorize(), portfolioCtrl.index);

router.get("/a/:username", portfolioCtrl.main);

// edit page to create new audio asset
router.get("/asset", authorize(), portfolioCtrl.addAsset);

// create an individual portfolio
router.post("/", authorize(), portfolioCtrl.create);

// create and add asset through a portfolio
router.post("/asset", authorize(), upload.any(), portfolioCtrl.createAsset);

// delete an individual portfolio
router.delete("/:id", authorize(), portfolioCtrl.delete);

export default router;
