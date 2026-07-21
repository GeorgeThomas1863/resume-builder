import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminAuthController, authController } from "../controllers/auth-control.js";

const response = () => {
  const res = { statusCode: 200, body: null };
  res.status = vi.fn((code) => { res.statusCode = code; return res; });
  res.json = vi.fn((body) => { res.body = body; return res; });
  return res;
};

beforeEach(() => {
  process.env.PW = "site-secret";
  process.env.ADMIN_PW = "admin-secret";
});

describe("authentication controllers", () => {
  it("marks a session authenticated after the site password succeeds", () => {
    const req = { body: { pw: "site-secret" }, ip: "site-success", session: {} };
    authController(req, response());
    expect(req.session.authenticated).toBe(true);
  });

  it("rate limits the eleventh failed site attempt per IP", () => {
    const ip = "site-rate-limit";
    for (let i = 0; i < 10; i++) authController({ body: { pw: "wrong" }, ip, session: {} }, response());
    const res = response();
    authController({ body: { pw: "wrong" }, ip, session: {} }, res);
    expect(res.statusCode).toBe(429);
  });

  it("keeps admin and site failure counters independent", () => {
    const ip = "tier-isolation";
    for (let i = 0; i < 10; i++) authController({ body: { pw: "wrong" }, ip, session: {} }, response());
    const req = { body: { pw: "admin-secret" }, ip, session: {} };
    adminAuthController(req, response());
    expect(req.session.isAdmin).toBe(true);
  });
});
