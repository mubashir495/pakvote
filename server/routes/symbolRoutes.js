import express from "express";
import {
  createSymbol,
  updateSymbol,
  getAllSymbols,
  getSymbolById,
  deleteSymbol,
} from "../controllers/symbolController.js";
import { symbolUpload } from "../utils/upload.js";
const router = express.Router();

// Middleware to handle multer errors
const handleMulterError = (uploadFunc) => (req, res, next) => {
  uploadFunc(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// CRUD routes
router.post("/", handleMulterError(symbolUpload.single("image")), createSymbol);
router.put("/:id", handleMulterError(symbolUpload.single("image")), updateSymbol);
router.get("/", getAllSymbols);
router.get("/:id", getSymbolById);
router.delete("/:id", deleteSymbol);

export default router;
