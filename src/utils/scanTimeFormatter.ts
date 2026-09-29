/**
 * Timestamp formatting utilities for scan history and cards.
 *
 * Requirements:
 * - Default display format: "29 Sep 2026 10:33 AM"
 * - Mobile adjusted display format: "29 Sep 10:33 AM"
 * - On hover tooltip: "Tuesday, 29 Sep 2026 at 10:33:45 AM • 2 minutes ago" (or "Just now")
 */

export function getRelativeTime(timestamp: number | string): string {
  const timeMs = typeof timestamp === "string" ? new Date(timestamp).getTime() : Number(timestamp);
  if (isNaN(timeMs)) return "Just now";

  const diffSec = Math.max(0, Math.floor((Date.now() - timeMs) / 1000));
  if (diffSec < 20) return "Just now";
  if (diffSec < 60) return `${diffSec} seconds ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
}

/**
 * Standard scan timestamp display:
 * Example output: "29 Sep 2026 10:33 AM"
 */
export function formatScanTimestamp(timestamp: number | string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";

  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${month} ${year} ${timeStr}`;
}

/**
 * Compact mobile scan timestamp display to prevent layout clipping on small screens:
 * Example output: "29 Sep 10:33 AM"
 */
export function formatScanTimestampMobile(timestamp: number | string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";

  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${month} ${timeStr}`;
}

/**
 * Detailed scan hover tooltip with day of week, time with seconds, and how many days/hours/minutes ago:
 * Example output: "Tuesday, 29 Sep 2026 at 10:33:45 AM • 2 minutes ago"
 */
export function getHoverScanDateTime(timestamp: number | string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";

  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  const timeWithSec = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const ago = getRelativeTime(timestamp);

  return `${weekday}, ${day} ${month} ${year} at ${timeWithSec} • ${ago}`;
}
