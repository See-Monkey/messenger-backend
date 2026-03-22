import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import userController from "../controllers/userController.js";

const router = Router();

router.get("/me", requireAuth, userController.getMe);
router.patch("/me", requireAuth, userController.updateMe);
router.patch("/me/password", requireAuth, userController.changeMyPassword);

router.get("/", requireAdmin, userController.getAllUsers);

router.get("/:id", userController.getPublicProfile);

router.delete("/:id", requireAdmin, userController.deleteUser);

export default router;
