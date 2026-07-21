import multer from "multer";
import { describe, expect, it, vi } from "vitest";
import { uploadErrorHandler } from "../middleware/upload-error.js";

const response = () => {
  const res = { statusCode: 200, body: null };
  res.status = vi.fn((code) => { res.statusCode = code; return res; });
  res.json = vi.fn((body) => { res.body = body; return res; });
  return res;
};

describe("upload error mapping", () => {
  it("maps Multer errors to a client error", () => {
    const res = response();
    uploadErrorHandler(new multer.MulterError("LIMIT_FILE_SIZE"), {}, res, vi.fn());
    expect(res.statusCode).toBe(400);
  });

  it("maps non-Multer errors to a server error", () => {
    const res = response();
    uploadErrorHandler(new Error("disk unavailable"), {}, res, vi.fn());
    expect(res.statusCode).toBe(500);
  });

  it("delegates when there is no error", () => {
    const next = vi.fn();
    uploadErrorHandler(null, {}, response(), next);
    expect(next).toHaveBeenCalledOnce();
  });
});
