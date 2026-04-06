import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect } from "../middlewares/authMiddlewares.js";
import { adminOnly } from "../middlewares/isRoleMiddleware.js";

const router = express.Router();

router.get("/", getSettings);
router.post("/", protect, adminOnly, updateSettings);

export default router;
