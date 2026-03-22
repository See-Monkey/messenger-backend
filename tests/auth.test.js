import { registerUser, loginUser } from "./helpers/authHelper.js";

describe("Auth Routes", () => {
	describe("POST /api/auth/register", () => {
		it("should register a new user and return token", async () => {
			const res = await registerUser({
				username: "testuser@example.com",
			});

			expect(res.status).toBe(201);

			expect(res.body).toHaveProperty("user");
			expect(res.body).toHaveProperty("token");

			expect(res.body.user.username).toBe("testuser@example.com");
			expect(res.body.user).not.toHaveProperty("password");
		});

		it("should not allow duplicate usernames", async () => {
			await registerUser({
				username: "duplicate@example.com",
			});

			const res = await registerUser({
				username: "duplicate@example.com",
			});

			expect(res.status).toBeGreaterThanOrEqual(400);
		});
	});

	describe("POST /api/auth/login", () => {
		it("should login with correct credentials", async () => {
			await registerUser({
				username: "loginuser@example.com",
			});

			const res = await loginUser({
				username: "loginuser@example.com",
			});

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("user");
			expect(res.body).toHaveProperty("token");
			expect(res.body.user.username).toBe("loginuser@example.com");
		});

		it("should reject invalid password", async () => {
			await registerUser({
				username: "wrongpass@example.com",
			});

			const res = await loginUser({
				username: "wrongpass@example.com",
				password: "wrongpassword",
			});

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid credentials");
		});

		it("should reject non-existent user", async () => {
			const res = await loginUser({
				username: "doesnotexist@example.com",
				password: "password123",
			});

			expect(res.status).toBe(401);
			expect(res.body.message).toBe("Invalid credentials");
		});
	});
});
