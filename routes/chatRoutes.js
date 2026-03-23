import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import chatController from "../controllers/chatController.js";
import messageController from "../controllers/messageController.js";

const router = Router();

// Get all chats for user
router.get("/", requireAuth, chatController.getChats);

// Get chat by ID
router.get("/:chatId", requireAuth, chatController.getChatById);

// Create new chat
router.post("/", requireAuth, chatController.createChat);

// Add user to chat
router.post("/:chatId/users", requireAuth, chatController.addUser);

// Leave chat
router.delete("/:chatId/users/me", requireAuth, chatController.removeMe);

// Add message to chat
router.post("/:chatId/messages", requireAuth, messageController.createMessage);

export default router;
