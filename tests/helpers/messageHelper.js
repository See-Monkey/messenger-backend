import request from "supertest";
import app from "../../app.js";

export const sendMessage = (chatId, content, token) => {
  return request(app)
    .post(`/api/chats/${chatId}/messages`)
    .set("Authorization", `Bearer ${token}`)
    .send({ content });
};

export const getMessages = (chatId, token) => {
  return request(app)
    .get(`/api/chats/${chatId}`)
    .set("Authorization", `Bearer ${token}`);
};
