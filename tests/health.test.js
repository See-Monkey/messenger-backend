import request from "supertest";
import app from "../app.js";

describe("GET /", () => {
	it("should return 200 and status OK", async () => {
		const res = await request(app).get("/");

		expect(res.status).toBe(200);
		expect(res.body.status).toBe("OK");
	});
});
