import { registerUser } from "./helpers/authHelper.js";
import { createChat } from "./helpers/chatHelper.js";
import { sendMessage, getMessages } from "./helpers/messageHelper.js";

describe("Message Routes", () => {
  describe("POST /api/chats/:chatId/messages", () => {
    it("should send a message", async () => {
      const user1 = await registerUser({
        username: "msg1@example.com",
      });
      const user2 = await registerUser({
        username: "msg2@example.com",
      });

      const token = user1.body.token;

      const chatRes = await createChat([user2.body.user.id], token);

      const chatId = chatRes.body.id;

      const res = await sendMessage(chatId, "Hello world", token);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.content).toBe("Hello world");
    });

    it("should not send empty message", async () => {
      const user = await registerUser({
        username: "emptymsg@example.com",
      });

      const token = user.body.token;

      const res = await sendMessage("invalid", "", token);

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("GET /api/chats/:chatId", () => {
    it("should fetch messages for chat", async () => {
      const user1 = await registerUser({
        username: "fetch1@example.com",
      });
      const user2 = await registerUser({
        username: "fetch2@example.com",
      });

      const token = user1.body.token;

      const chatRes = await createChat([user2.body.user.id], token);

      const chatId = chatRes.body.id;

      await sendMessage(chatId, "Test message", token);

      const res = await getMessages(chatId, token);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.messages)).toBe(true);
      expect(res.body.messages.length).toBeGreaterThan(0);
    });
  });
});
