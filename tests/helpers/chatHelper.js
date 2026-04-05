import request from "supertest";
import app from "../../app.js";

export const createChat = (userIds, token) => {
  return request(app)
    .post("/api/chats")
    .set("Authorization", `Bearer ${token}`)
    .send({ userIds });
};

export const getChats = (token) => {
  return request(app).get("/api/chats").set("Authorization", `Bearer ${token}`);
};
