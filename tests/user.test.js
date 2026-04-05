import { registerUser } from "./helpers/authHelper.js";
import { getMe, searchUsers } from "./helpers/userHelper.js";

describe("User Routes", () => {
  describe("GET /api/users/me", () => {
    it("should return current user", async () => {
      const registerRes = await registerUser({
        username: "me@example.com",
      });

      const token = registerRes.body.token;

      const res = await getMe(token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body.username).toBe("me@example.com");
      expect(res.body).not.toHaveProperty("password");
    });

    it("should reject unauthenticated request", async () => {
      const res = await getMe("");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/users", () => {
    it("should search users", async () => {
      await registerUser({ username: "search1@example.com" });
      await registerUser({ username: "search2@example.com" });

      const loginRes = await registerUser({
        username: "searcher@example.com",
      });

      const token = loginRes.body.token;

      const res = await searchUsers("search", token);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
