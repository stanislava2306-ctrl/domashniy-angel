import { Badge } from "@/components/ui/badge";
import type { InsightSeverity, Mode, RiskLevel, SubscriptionStatus } from "@/lib/domain";

export function ModeBadge({ mode }: { mode: Mode }) {
  return <Badge variant={mode === "safety_plus" ? "destructive" : "secondary"}>{mode === "safety_plus" ? "Safety Plus" : "Support 65"}</Badge>;
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  if (risk === "critical") {
    return <Badge variant="destructive">Критично</Badge>;
  }

  if (risk === "attention") {
    return (
      <Badge variant="outline" className="border-amber-300 text-amber-700">
        Внимание
      </Badge>
    );
  }

  return <Badge variant="secondary">Инфо</Badge>;
}

export function InsightSeverityBadge({ severity }: { severity: InsightSeverity }) {
  if (severity === "attention") {
    return (
      <Badge variant="outline" className="border-amber-300 text-amber-700">
        Внимание
      </Badge>
    );
  }

  return <Badge variant="secondary">Спокойно</Badge>;
}

export function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  if (status === "active") {
    return <Badge variant="secondary">active</Badge>;
  }

  if (status === "paused") {
    return <Badge variant="outline">paused</Badge>;
  }

  return <Badge variant="destructive">canceled</Badge>;
}
