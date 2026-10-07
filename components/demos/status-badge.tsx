import { StatusBadge } from "@/registry/damon/ui/status-badge"

const statuses = ["paid", "pending_review", "overdue", "sent", "draft", "Partially paid", "ready_for_pickup"]

export default function StatusBadgeDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground uppercase">dot (default)</p>
        <ul className="space-y-2">
          {statuses.map((s) => (
            <li key={s}>
              <StatusBadge status={s} tones={{ ready_for_pickup: "success" }} />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground uppercase">pill</p>
        <ul className="space-y-2">
          {statuses.map((s) => (
            <li key={s}>
              <StatusBadge status={s} variant="pill" tones={{ ready_for_pickup: "success" }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
