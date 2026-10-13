import { Session } from "../models/Session.js";

/**
 * Parses user agent header into readable browser, OS, and device type.
 */
export const parseUserAgent = (userAgentString = "") => {
  const ua = userAgentString.toLowerCase();

  // OS detection
  let os = "Unknown OS";
  if (ua.includes("windows nt 10.0")) os = "Windows 10/11";
  else if (ua.includes("windows nt")) os = "Windows";
  else if (ua.includes("macintosh") || ua.includes("mac os x")) os = "macOS";
  else if (ua.includes("iphone")) os = "iOS (iPhone)";
  else if (ua.includes("ipad")) os = "iPadOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("linux")) os = "Linux";

  // Browser detection
  let browser = "Browser";
  if (ua.includes("edg/")) browser = "Microsoft Edge";
  else if (ua.includes("chrome/") && !ua.includes("edg/")) browser = "Google Chrome";
  else if (ua.includes("safari/") && !ua.includes("chrome/")) browser = "Apple Safari";
  else if (ua.includes("firefox/")) browser = "Mozilla Firefox";
  else if (ua.includes("opr/") || ua.includes("opera/")) browser = "Opera";

  // Device type
  let device = "Desktop";
  if (ua.includes("mobile") || ua.includes("iphone") || (ua.includes("android") && !ua.includes("tablet"))) {
    device = "Mobile";
  } else if (ua.includes("ipad") || ua.includes("tablet")) {
    device = "Tablet";
  }

  return { browser, os, device };
};

/**
 * Extracts client IP safely.
 */
export const getClientIp = (req) => {
  const forwarded = req?.headers?.["x-forwarded-for"];
  if (forwarded) {
    const list = String(forwarded).split(",");
    return list[0].trim();
  }
  const ip = req?.ip || req?.connection?.remoteAddress || "127.0.0.1";
  if (ip === "::1" || ip === "::ffff:127.0.0.1") return "127.0.0.1";
  return ip.replace(/^::ffff:/, "");
};

/**
 * Creates a new tracked session for a user.
 */
export const createSession = async ({ userId, req, token = null, durationDays = 7 }) => {
  try {
    const uaString = req?.headers?.["user-agent"] || "";
    const { browser, os, device } = parseUserAgent(uaString);
    const ipAddress = getClientIp(req);
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const session = await Session.create({
      user: userId,
      token,
      device,
      browser,
      os,
      ipAddress,
      userAgent: uaString.slice(0, 500),
      lastActive: new Date(),
      expiresAt,
      isActive: true,
    });

    return session;
  } catch (err) {
    console.error("[SessionHelper] Error creating session:", err.message);
    return null;
  }
};

/**
 * Touches session to refresh lastActive timestamp (throttled to 60s).
 */
export const touchSession = async (sessionId) => {
  if (!sessionId) return;
  try {
    const now = new Date();
    // Only update if lastActive is older than 60 seconds
    const threshold = new Date(now.getTime() - 60 * 1000);
    await Session.updateOne(
      { _id: sessionId, lastActive: { $lt: threshold } },
      { $set: { lastActive: now } }
    );
  } catch (err) {
    console.error("[SessionHelper] Error touching session:", err.message);
  }
};

/**
 * Revokes a single session.
 */
export const revokeSession = async (sessionId, userId) => {
  return Session.findOneAndUpdate(
    { _id: sessionId, user: userId },
    { $set: { isActive: false } },
    { new: true }
  );
};

/**
 * Revokes all sessions for user except current one.
 */
export const revokeOtherSessions = async (currentSessionId, userId) => {
  return Session.updateMany(
    { user: userId, _id: { $ne: currentSessionId }, isActive: true },
    { $set: { isActive: false } }
  );
};

/**
 * Retrieves all active sessions for a user.
 */
export const getUserSessions = async (userId, currentSessionId = null) => {
  const sessions = await Session.find({
    user: userId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  })
    .sort({ lastActive: -1 })
    .lean();

  return sessions.map((s) => ({
    _id: String(s._id),
    device: s.device,
    browser: s.browser,
    os: s.os,
    ipAddress: s.ipAddress,
    lastActive: s.lastActive,
    createdAt: s.createdAt,
    isCurrent: Boolean(currentSessionId && String(s._id) === String(currentSessionId)),
  }));
};
