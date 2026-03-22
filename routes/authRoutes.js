import { Router } from "express";
import authController from "../controllers/authController.js";

const router = Router();

// Register new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

export default router;
