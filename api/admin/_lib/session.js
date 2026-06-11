import { createHmac, timingSafeEqual } from "node:crypto";

const sessionDurationMs = 2 * 60 * 60 * 1000;

function secret() {
  return [
    process.env.ADMIN_PASSWORD,
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.VITE_SUPABASE_URL,
  ]
    .filter(Boolean)
    .join(":");
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(role, inviteGroupId = null) {
  const expiresAt = Date.now() + sessionDurationMs;
  const payload = base64UrlEncode(JSON.stringify({ role, expiresAt, inviteGroupId }));
  return {
    role,
    expiresAt,
    inviteGroupId,
    token: `${payload}.${sign(payload)}`,
  };
}

export function verifySessionToken(token) {
  if (!token || !secret()) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const session = JSON.parse(base64UrlDecode(payload));
    if (!["lunch", "full", "admin"].includes(session.role) || Number(session.expiresAt) <= Date.now()) {
      return null;
    }
    return {
      role: session.role,
      expiresAt: Number(session.expiresAt),
      inviteGroupId: typeof session.inviteGroupId === "string" ? session.inviteGroupId : null,
    };
  } catch {
    return null;
  }
}

export function requireAdmin(req, res) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const session = verifySessionToken(token);

  if (session?.role !== "admin") {
    res.status(401).json({ error: "Admin session required." });
    return null;
  }

  return session;
}

export function jsonMethod(req, res, methods) {
  if (methods.includes(req.method)) return true;

  res.setHeader("Allow", methods.join(", "));
  res.status(405).json({ error: "Method not allowed." });
  return false;
}
