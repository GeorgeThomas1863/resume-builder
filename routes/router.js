import express from "express";

import requireAuth from "../middleware/auth-config.js";
import { displayMain, display401, display404, display500 } from "../controllers/display-control.js";
import { authController } from "../controllers/auth-control.js";
import { uploadResumeController, getBackendValueController, submitRouteController, checkRouteController, deleteResumeController } from "../controllers/data-control.js";
import { upload } from "../src/upload-file.js";

const router = express.Router();

router.post("/site-auth-route", authController);
router.get("/401", display401);

router.post("/get-backend-value-route", requireAuth, getBackendValueController);

router.post("/upload", requireAuth, upload.single("resume"), uploadResumeController);
router.get("/check-file", requireAuth, checkRouteController);
router.get("/delete-resume", requireAuth, deleteResumeController);

router.post("/submit", requireAuth, submitRouteController);

router.get("/", requireAuth, displayMain);

router.use(display404);

router.use(display500);

export default router;
