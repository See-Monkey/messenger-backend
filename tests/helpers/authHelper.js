import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../config/prisma.js";

// Registers a user.
// Returns full Supertest response.
export async function registerUser(overrides = {}) {
	const userData = {
		username: "test@example.com",
		password: "password123",
		confirmPassword: "password123",
		firstname: "Test",
		lastname: "User",
		...overrides,
	};

	return request(app).post("/api/auth/register").send(userData);
}

// Logs in a user.
// Returns full Supertest response.
export async function loginUser(overrides = {}) {
	const credentials = {
		username: "test@example.com",
		password: "password123",
		...overrides,
	};

	return request(app).post("/api/auth/login").send(credentials);
}

// Convenience helper:
// Registers + logs in
// Returns { user, token }
export async function createAuthenticatedUser(overrides = {}) {
	await registerUser(overrides);
	const loginRes = await loginUser(overrides);
	return loginRes.body;
}

// Registers a user, promotes them to ADMIN,
// logs them in, and returns:
// { user, token }
export async function createAdminUser(overrides = {}) {
	const username = overrides.username || "admin@example.com";

	// 1. Register normally
	await registerUser({ username, ...overrides });

	// 2. Promote to admin directly in DB
	await prisma.user.update({
		where: { username },
		data: { role: "ADMIN" },
	});

	// 3. Login
	const loginRes = await loginUser({ username, ...overrides });

	return loginRes.body; // { user, token }
}
