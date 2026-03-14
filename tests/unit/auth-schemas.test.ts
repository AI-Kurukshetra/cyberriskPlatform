import { describe, it, expect } from "vitest";
import { z } from "zod";

/** Mirrors login-form + signup validation rules — fast regression guard */
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

describe("loginSchema", () => {
  it("accepts valid credentials shape", () => {
    expect(() =>
      loginSchema.parse({ email: "a@b.co", password: "12345678" })
    ).not.toThrow();
  });

  it("rejects short password", () => {
    const r = loginSchema.safeParse({ email: "a@b.co", password: "short" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = loginSchema.safeParse({ email: "not-an-email", password: "12345678" });
    expect(r.success).toBe(false);
  });
});
