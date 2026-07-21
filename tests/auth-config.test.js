import { describe, expect, it, vi } from "vitest";
import requireAuth, { requireAdminAuth } from "../middleware/auth-config.js";

const response = () => ({ setHeader: vi.fn(), sendFile: vi.fn() });

describe("authentication guards", () => {
  it("continues authenticated requests", () => {
    const next = vi.fn();
    requireAuth({ session: { authenticated: true } }, response(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("serves the auth page for unauthenticated requests", () => {
    const res = response();
    requireAuth({ session: {} }, res, vi.fn());
    expect(res.sendFile).toHaveBeenCalledWith(expect.stringMatching(/[\\/]html[\\/]auth\.html$/));
  });

  it("continues admin requests", () => {
    const next = vi.fn();
    requireAdminAuth({ session: { isAdmin: true } }, response(), next);
    expect(next).toHaveBeenCalledOnce();
  });
});
