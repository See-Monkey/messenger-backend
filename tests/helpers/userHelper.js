import request from "supertest";
import app from "../../app.js";

export const getMe = (token) => {
	return request(app)
		.get("/api/users/me")
		.set("Authorization", `Bearer ${token}`);
};

export const searchUsers = (query, token) => {
	return request(app)
		.get(`/api/users?search=${query}`)
		.set("Authorization", `Bearer ${token}`);
};
