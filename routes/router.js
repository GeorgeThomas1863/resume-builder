import express from "express";

import requireAuth from "./auth.js";
import { displayMain, display401, display404, display500 } from "../controllers/display-control.js";
import { authController } from "../controllers/auth-control.js";
import { uploadResumeController, getBackendValueController, submitRouteController, checkRouteController } from "../controllers/data-control.js";
import { upload } from "../config/upload-config.js";
import CONFIG from "../config/config.js";

const { uploadRoute, checkRoute, submitRoute } = CONFIG;

const router = express.Router();

router.post("/site-auth-route", authController);
router.get("/401", display401);

router.post("/get-backend-value-route", requireAuth, getBackendValueController);

router.post(uploadRoute, requireAuth, upload.single("resume"), uploadResumeController);
router.get(checkRoute, requireAuth, checkRouteController);

router.post(submitRoute, requireAuth, submitRouteController);

router.get("/", requireAuth, displayMain);

router.use(display404);

router.use(display500);

export default router;
