import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vitest/config";

function localApiPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), "");
  const sessionDurationMs = 2 * 60 * 60 * 1000;
  const guestPasswords = {
    lunchPassword: env.LUNCH_PASSWORD || "samplechurchpass",
    fullPassword: env.FULL_PASSWORD || "sampledinnerpass"
  };
  const summary = {
    totalInviteGroups: 0,
    ceremonyInvited: 0,
    ceremonyAttending: 0,
    dinnerInvited: 0,
    dinnerAttending: 0,
    pendingResponses: 0,
    mealCounts: {
      "Option 1": 0,
      "Option 2": 0,
      Halal: 0,
      Vegetarian: 0
    }
  };

  const readJsonBody = async (req: import("node:http").IncomingMessage) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const text = Buffer.concat(chunks).toString("utf8");
    return text ? JSON.parse(text) as Record<string, unknown> : {};
  };

  const sendJson = (res: import("node:http").ServerResponse, status: number, payload: unknown) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload));
  };

  const adminAuthorized = (req: import("node:http").IncomingMessage) => {
    const header = req.headers.authorization || "";
    const token = Array.isArray(header) ? header[0] : header;
    return token.startsWith("Bearer admin:");
  };

  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] || "";
        if (!url.startsWith("/api/")) {
          next();
          return;
        }

        try {
          if (url === "/api/auth/login" && req.method === "POST") {
            const body = await readJsonBody(req);
            const password = String(body.password || "");
            const expiresAt = Date.now() + sessionDurationMs;
            const tokenFor = (role: "lunch" | "full" | "admin") => `${role}:${expiresAt}:local-dev`;

            if (env.ADMIN_PASSWORD && password === env.ADMIN_PASSWORD) {
              sendJson(res, 200, { role: "admin", expiresAt, token: tokenFor("admin") });
              return;
            }

            if (password === guestPasswords.fullPassword) {
              sendJson(res, 200, { role: "full", expiresAt, token: tokenFor("full") });
              return;
            }

            if (password === guestPasswords.lunchPassword) {
              sendJson(res, 200, { role: "lunch", expiresAt, token: tokenFor("lunch") });
              return;
            }

            sendJson(res, 401, { error: "Invalid password." });
            return;
          }

          if (!adminAuthorized(req)) {
            sendJson(res, 401, { error: "Admin session required." });
            return;
          }

          if (url === "/api/admin/settings/passwords" && req.method === "GET") {
            sendJson(res, 200, guestPasswords);
            return;
          }

          if (url === "/api/admin/settings/passwords" && req.method === "PUT") {
            const body = await readJsonBody(req);
            guestPasswords.lunchPassword = String(body.lunchPassword || "").trim();
            guestPasswords.fullPassword = String(body.fullPassword || "").trim();
            sendJson(res, 200, guestPasswords);
            return;
          }

          if (url === "/api/admin/summary" && req.method === "GET") {
            sendJson(res, 200, { summary });
            return;
          }

          if (url === "/api/admin/invites" && req.method === "GET") {
            sendJson(res, 200, { rows: [] });
            return;
          }

          sendJson(res, 404, { error: "Local dev API route not implemented." });
        } catch (error) {
          sendJson(res, 500, { error: error instanceof Error ? error.message : "Local dev API error." });
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [localApiPlugin(mode), react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts"
  }
}));
