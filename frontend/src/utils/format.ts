/** Minutes -> "1h 25m" / "45m" / "0m" */
export const formatDuration = (totalMin?: number): string => {
  const min = Math.max(0, Math.round(totalMin || 0));
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const capitalize = (value?: string): string =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

export const getInitials = (name?: string, fallback = "ST"): string => {
  if (!name) return fallback;
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || fallback;
};

/** ISO date -> "5 minutes ago", "2 days ago", or a short date after a week. */
export const timeAgo = (iso?: string): string => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/** Group label used by the activity timeline. */
export const dateGroup = (iso?: string): string => {
  if (!iso) return "Earlier";
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor(
    (startOfToday.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      86400000
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This Week";
  return "Earlier";
};

/** Stable visual theme for a course card, based on its position / title. */
const THEMES = [
  { icon: "⚛️", name: "blue" },
  { icon: "🐍", name: "green" },
  { icon: "🎨", name: "purple" },
  { icon: "🟢", name: "teal" },
  { icon: "🍃", name: "dark-green" },
  { icon: "💡", name: "yellow" },
];

export const courseTheme = (seed: number) => THEMES[Math.abs(seed) % THEMES.length];

/** Every course is free in this version: there is no price in the data model. */
export const PRICE_LABEL = "Free";

/** Pull a YouTube id out of a watch / share / embed URL. */
export const getYouTubeEmbedUrl = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};
