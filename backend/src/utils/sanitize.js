// Escape user input before using it inside a MongoDB $regex.
export const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Query-string values can arrive as arrays/objects (e.g. ?level[$ne]=x).
// Only accept plain strings to avoid operator injection.
export const asString = (value) =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
