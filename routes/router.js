import express from "express";

// import CONFIG from "../config/config.js";
import requireAuth from "./auth.js";
import { displayMain, display401, display404, display500 } from "../controllers/display-control.js";
// import { tgCommandControl } from "../controllers/data-control.js";
import { authController } from "../controllers/auth-control.js";

const router = express.Router();

router.post("/site-auth-route", authController);
router.get("/401", display401);

//tg command sumbit
// router.post("/tg-submit-route", requireAuth, tgCommandControl);

//tg display route
router.get("/", requireAuth, displayMain);

router.use(display404);

router.use(display500);

export default router;
