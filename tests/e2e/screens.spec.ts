import { test, expect } from "@playwright/test";

/**
 * E2E checks per screen: public UI + auth gate on app routes.
 * Run: npx playwright test
 * Requires: npm run dev (or webServer in config)
 */

test.describe("Marketing /", () => {
  test("loads hero and primary CTA copy", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByText(/client|workspace|pipeline/i).first()
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up|log in/i }).first()).toBeVisible();
  });

  test("header links reach auth", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /log in/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Login /login", () => {
  test("shows email login story and welcome card", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/email login/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
  });

  test("links to signup", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /sign up|need an account/i }).click();
    await expect(page).toHaveURL(/\/signup/);
  });
});

test.describe("Signup /signup", () => {
  test("shows trial framing and signup form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText(/start your free trial/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });

  test("links to login", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("link", { name: /log in|already have/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Onboarding /onboarding (unauthenticated)", () => {
  test("redirects to login when no session", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("App shell (unauthenticated) — expect login redirect", () => {
  const protectedPaths = [
    ["/dashboard", "dashboard"],
    ["/clients", "clients"],
    ["/pipeline", "pipeline"],
    ["/tasks", "tasks"],
    ["/settings", "settings"],
  ] as const;

  for (const [path] of protectedPaths) {
    test(`${path} redirects to login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe("Invite /invite/[token] (unauthenticated)", () => {
  test("unknown token redirects to login with invite message", async ({ page }) => {
    await page.goto("/invite/invalid-token-0000");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.url()).toContain("message=");
  });
});

test.describe("API healthcheck", () => {
  test("GET /api/healthcheck returns ok", async ({ request }) => {
    const res = await request.get("/api/healthcheck");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toMatchObject({ status: "ok" });
    expect(body.timestamp).toBeDefined();
  });
});
