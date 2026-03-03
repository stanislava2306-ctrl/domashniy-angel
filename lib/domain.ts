export type Role = "caregiver" | "senior";
export type Mode = "support_65" | "safety_plus";
export type DeviceType = "hub" | "motion" | "door" | "gas" | "water" | "watch";
export type DeviceStatus = "online" | "offline" | "unknown";
export type EventSource = "home" | "watch";
export type EventType =
  | "motion"
  | "door_open"
  | "gas_detected"
  | "water_leak"
  | "sos"
  | "geofence_exit"
  | "no_motion";
export type RiskLevel = "info" | "attention" | "critical";
export type InsightKind = "activity_drop" | "night_awake_increase" | "less_walks" | "routine_shift";
export type InsightSeverity = "info" | "attention";
export type AccessLevel = "viewer" | "admin";
export type SubscriptionStatus = "active" | "paused" | "canceled";
export type Feedback = "useful" | "not_useful";

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

export const MODE_LABELS: Record<Mode, string> = {
  support_65: "Support 65",
  safety_plus: "Safety Plus"
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  info: "Инфо",
  attention: "Внимание",
  critical: "Критично"
};

export const EVENT_LABELS: Record<EventType, string> = {
  motion: "Движение",
  door_open: "Открытие двери",
  gas_detected: "Газ",
  water_leak: "Вода",
  sos: "SOS",
  geofence_exit: "Выход из геозоны",
  no_motion: "Нет движения"
};

export function isNightHour(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 22 || hour < 6;
}

export function resolveRiskLevel(eventType: EventType, mode: Mode, occurredAt: Date): RiskLevel {
  if (eventType === "sos" || eventType === "gas_detected" || eventType === "water_leak") {
    return "critical";
  }

  if (eventType === "door_open" && isNightHour(occurredAt)) {
    return mode === "safety_plus" ? "critical" : "attention";
  }

  if (eventType === "no_motion") {
    return "attention";
  }

  if (eventType === "geofence_exit") {
    return mode === "safety_plus" ? "critical" : "attention";
  }

  return "info";
}

export function eventSourceForType(eventType: EventType): EventSource {
  return eventType === "sos" || eventType === "geofence_exit" ? "watch" : "home";
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("ru-RU");
}
