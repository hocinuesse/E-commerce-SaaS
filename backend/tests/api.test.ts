/// <reference types="jest" />
import request from "supertest";
import { app } from "../src/app";

describe("🏥 Health & Core API Tests", () => {
  it("GET /health should return 200 with status ok and uptime", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("POST /api/v1/auth/register should fail validation when fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("status", "fail");
    expect(res.body).toHaveProperty("errors");
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it("POST /api/v1/auth/login should fail validation when email/password missing", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "invalid-email" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("status", "fail");
    expect(res.body).toHaveProperty("errors");
  });

  it("GET /non-existent-route should be handled gracefully by global error", async () => {
    const res = await request(app).get("/api/v1/non-existent-route");
    expect([404, 500]).toContain(res.status);
  });
});
