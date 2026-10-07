import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info"

/**
 * Common status values → tone. Keys are normalised (lowercase, `_` for spaces
 * and dashes). Pass `tones` to add or override entries for your domain.
 */
export const DEFAULT_STATUS_TONES: Record<string, StatusTone> = {
  // done / healthy
  active: "success",
  accepted: "success",
  approved: "success",
  complete: "success",
  delivered: "success",
  done: "success",
  healthy: "success",
  paid: "success",
  passed: "success",
  published: "success",
  resolved: "success",
  reviewed: "success",
  shipped: "success",
  succeeded: "success",
  verified: "success",
  // needs follow-up
  awaiting: "warning",
  in_review: "warning",
  on_hold: "warning",
  partially_paid: "warning",
  pending: "warning",
  pending_review: "warning",
  unpaid: "warning",
  warning: "warning",
  // broken / overdue
  blocked: "danger",
  declined: "danger",
  error: "danger",
  failed: "danger",
  firing: "danger",
  overdue: "danger",
  // in motion
  acknowledged: "info",
  completed: "info",
  filed: "info",
  in_progress: "info",
  new: "info",
  open: "info",
  processing: "info",
  running: "info",
  scheduled: "info",
  sent: "info",
  submitted: "info",
  // inert
  archived: "neutral",
  canceled: "neutral",
  cancelled: "neutral",
  disabled: "neutral",
  draft: "neutral",
  expired: "neutral",
  inactive: "neutral",
  queued: "neutral",
  rejected: "neutral",
  revoked: "neutral",
  stale: "neutral",
  unknown: "neutral",
}

/** `"Pending Review"`, `"pending-review"` → `"pending_review"`. */
export function normalizeStatus(status: string): string {
  return status.trim().toLowerCase().replace(/[\s-]+/g, "_")
}

/** Tone for a status, falling back to `"neutral"`. */
export function statusTone(status: string, tones?: Record<string, StatusTone>): StatusTone {
  const key = normalizeStatus(status)
  return tones?.[key] ?? DEFAULT_STATUS_TONES[key] ?? "neutral"
}

/**
 * `"pending_review"` → `"Pending review"`. Only the first letter is upper
 * case: CSS `capitalize` would turn `"Sin pagar"` into `"Sin Pagar"`.
 */
export function humanizeStatus(status: string): string {
  const text = status.trim().replace(/[_-]+/g, " ")
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "—"
}

const badgeVariants = cva("inline-flex shrink-0 items-center gap-1.5 text-sm whitespace-nowrap", {
  variants: {
    variant: {
      dot: "text-foreground",
      pill: "rounded-full px-2 py-0.5 text-xs font-medium",
    },
    tone: { neutral: "", success: "", warning: "", danger: "", info: "" },
  },
  compoundVariants: [
    { variant: "pill", tone: "neutral", className: "bg-muted text-muted-foreground" },
    { variant: "pill", tone: "success", className: "bg-success/10 text-success" },
    { variant: "pill", tone: "warning", className: "bg-warning/10 text-warning" },
    { variant: "pill", tone: "danger", className: "bg-destructive/10 text-destructive" },
    { variant: "pill", tone: "info", className: "bg-info/10 text-info" },
  ],
})

const dotTones: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground/50",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
}

export interface StatusBadgeProps extends React.ComponentProps<"span"> {
  /** Raw status value, e.g. `"pending_review"`. Drives tone and default label. */
  status: string
  /** Visible text. Default: `humanizeStatus(status)`. Pass a translation here. */
  label?: React.ReactNode
  /** Force a tone instead of looking it up. */
  tone?: StatusTone
  /** Extra or overriding status → tone entries. */
  tones?: Record<string, StatusTone>
  /** `dot` (default): coloured dot + text, quiet enough for dense tables. `pill`: tinted chip. */
  variant?: "dot" | "pill"
}

/** Status shown as a coloured dot (or tinted pill) plus a text label. Colour is never the only signal. */
function StatusBadge({ status, label, tone, tones, variant = "dot", className, ...props }: StatusBadgeProps) {
  const resolved = tone ?? statusTone(status, tones)
  return (
    <span
      data-slot="status-badge"
      data-status={normalizeStatus(status)}
      data-tone={resolved}
      className={cn(badgeVariants({ variant, tone: resolved }), className)}
      {...props}
    >
      {variant === "dot" ? (
        <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", dotTones[resolved])} />
      ) : null}
      {label ?? humanizeStatus(status)}
    </span>
  )
}

export { StatusBadge }
