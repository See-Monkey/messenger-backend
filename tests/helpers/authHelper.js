import request from "supertest";
import app from "../../app.js";

// Registers a user.
// Returns full Supertest response.
export async function registerUser(overrides = {}) {
	const unique = Date.now() + Math.random();

	const username = overrides.username || `test${unique}@example.com`;

	const userData = {
		username,
		password: "password123",
		confirmPassword: "password123",
		displayName: "Test User",
		themeColor: "#000000",
		...overrides,
	};

	return request(app).post("/api/auth/register").send(userData);
}

// Logs in a user.
// Returns full Supertest response.
export async function loginUser({ username, password = "password123" }) {
	return request(app).post("/api/auth/login").send({ username, password });
}

// Registers + logs in
// Returns { user, token }
export async function createAuthenticatedUser(overrides = {}) {
	const registerRes = await registerUser(overrides);

	const username = registerRes.body.user.username;

	const loginRes = await loginUser({
		username,
		password: overrides.password || "password123",
	});

	return loginRes.body; // { user, token }
}

export async function createUserAndToken(overrides = {}) {
	const res = await createAuthenticatedUser(overrides);
	return {
		user: res.user,
		token: res.token,
	};
}
