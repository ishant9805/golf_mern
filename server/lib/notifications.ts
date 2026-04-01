export type NotificationLevel = "info" | "success" | "warning" | "error";

export function notify(level: NotificationLevel, message: string) {
  const prefix = `[${level.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
  return {
    level,
    message,
    createdAt: new Date().toISOString()
  };
}
