import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import messageController from "../controllers/messageController.js";

const router = Router();

// Edit message
router.patch("/:messageId", requireAuth, messageController.editMessage);

// Delete message
router.delete("/:messageId", requireAuth, messageController.deleteMessage);

export default router;
