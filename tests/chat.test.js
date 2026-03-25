import { registerUser } from "./helpers/authHelper.js";
import { createChat, getChats } from "./helpers/chatHelper.js";

describe("Chat Routes", () => {
	describe("POST /api/chats", () => {
		it("should create a chat between users", async () => {
			const user1 = await registerUser({
				username: "chat1@example.com",
			});
			const user2 = await registerUser({
				username: "chat2@example.com",
			});

			const token = user1.body.token;

			const res = await createChat([user2.body.user.id], token);

			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("id");
			expect(res.body.chatMembers.length).toBeGreaterThanOrEqual(2);
		});

		it("should not create chat without auth", async () => {
			const res = await createChat([], "");

			expect(res.status).toBe(401);
		});
	});

	describe("GET /api/chats", () => {
		it("should return user chats", async () => {
			const user = await registerUser({
				username: "getchats@example.com",
			});

			const token = user.body.token;

			const res = await getChats(token);

			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data)).toBe(true);
		});
	});
});
