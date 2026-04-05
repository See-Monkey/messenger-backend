import { registerUser, loginUser } from "./helpers/authHelper.js";
import { createChat } from "./helpers/chatHelper.js";
import { sendMessage, getMessages } from "./helpers/messageHelper.js";

describe("Full Integration Flow", () => {
  it("should complete full messaging flow", async () => {
    const user1 = await registerUser({
      username: "flow1@example.com",
    });
    const user2 = await registerUser({
      username: "flow2@example.com",
    });

    const login = await loginUser({
      username: "flow1@example.com",
    });

    const token = login.body.token;

    const chat = await createChat([user2.body.user.id], token);

    const chatId = chat.body.id;

    await sendMessage(chatId, "Hello", token);
    await sendMessage(chatId, "How are you?", token);

    const messages = await getMessages(chatId, token);

    expect(messages.status).toBe(200);
    expect(messages.body.messages.length).toBe(2);
  });
});
