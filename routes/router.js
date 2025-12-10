import express from "express";

// import CONFIG from "../config/config.js";
import requireAuth from "./auth.js";
import { displayMain, display401, display404, display500 } from "../controllers/display-control.js";
import { authController } from "../controllers/auth-control.js";
import { uploadResumeController } from "../controllers/data-control.js";
import { upload } from "../config/upload-config.js";

const router = express.Router();

router.post("/site-auth-route", authController);
router.get("/401", display401);

router.post("/upload-resume", requireAuth, upload.single("resume"), uploadResumeController);

router.get("/", requireAuth, displayMain);

router.use(display404);

router.use(display500);

export default router;
