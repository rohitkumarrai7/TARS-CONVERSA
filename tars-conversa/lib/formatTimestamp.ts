import { format, isToday, isYesterday, isSameYear } from "date-fns";

/**
 * Formats a message timestamp for display inside chat bubbles.
 * - Same day: "2:34 PM"
 * - Same year, different day: "Feb 15, 2:34 PM"
 * - Different year: "Feb 15 2023, 2:34 PM"
 */
export function formatMessageTime(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isSameYear(date, now)) {
    return format(date, "MMM d, h:mm a");
  }
  return format(date, "MMM d yyyy, h:mm a");
}

/**
 * Formats a last-seen timestamp into a human-readable string.
 * - Under 1 min: "Just now"
 * - Under 1 hour: "X minutes ago"
 * - Today: "Today at 2:34 PM"
 * - Yesterday: "Yesterday at 2:34 PM"
 * - Older: "Feb 15 at 2:34 PM"
 */
export function formatLastSeen(ts: number): string {
  const date = new Date(ts);
  const diffMs = Date.now() - ts;

  if (diffMs < 60_000) return "Just now";
  if (diffMs < 3_600_000) {
    const mins = Math.floor(diffMs / 60_000);
    return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  }
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  }
  return `${format(date, "MMM d")} at ${format(date, "h:mm a")}`;
}

/**
 * Formats a timestamp for the date divider shown between
 * message groups in the chat window.
 * - Today: "Today"
 * - Yesterday: "Yesterday"
 * - Same year: "February 15"
 * - Different year: "February 15, 2023"
 */
export function formatDateDivider(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isSameYear(date, now)) return format(date, "MMMM d");
  return format(date, "MMMM d, yyyy");
}

/**
 * Formats a timestamp for conversation list preview.
 * - Today: "2:34 PM"
 * - Yesterday: "Yesterday"
 * - This week: "Mon"
 * - Older: "Feb 15"
 */
export function formatConversationTime(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  if (isSameYear(date, now)) return format(date, "EEE");
  return format(date, "MMM d");
}
