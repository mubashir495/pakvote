import express from "express";

import {
  registerUser,
  loginUser,
  verifyUser,
  getProfile,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

import {
  protect,
  adminOnly,
  candidateOnly,
} from "../middlewares/authmiddlewares.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", protect, verifyUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

router.get(
  "/candidate/dashboard",
  protect,
  candidateOnly,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Candidate",
      user: req.user,
    });
  }
);

router.get(
  "/admin/dashboard",
  protect,
  adminOnly,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Admin",
      user: req.user,
    });
  }
);

export default router;
