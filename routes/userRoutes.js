import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import userController from "../controllers/userController.js";

const router = Router();

// Get my account
router.get("/me", requireAuth, userController.getMe);

// Update my account
router.patch("/me", requireAuth, userController.updateMe);
router.patch("/me/password", requireAuth, userController.changeMyPassword);

// Delete my account
router.delete("/me", requireAuth, userController.deleteMe);

// Get profile
router.get("/:userId", requireAuth, userController.getProfile);

export default router;
