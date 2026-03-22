import "./config/env.js";
import express from "express";
import cors from "cors";
import passport from "passport";
import { configurePassport } from "./config/passport.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// cross origin resource sharing
app.use(
	cors({
		origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : "*",
	}),
);

// parse JSON payload into req.body
app.use(express.json());

// setup passport
configurePassport();
app.use(passport.initialize());

// Health check
app.get("/", (req, res) => {
	res.json({
		name: "messenger",
		version: "1.0.0",
		status: "OK",
	});
});

// custom routers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// 404 for no routes found
app.use((req, res) => {
	res.status(404).json({ message: "Route not found" });
});

// catch middleware errors
app.use(errorHandler);

export default app;
