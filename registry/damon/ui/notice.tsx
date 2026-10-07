import * as React from "react"
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export type NoticeTone = "info" | "success" | "warning" | "danger"

const tones: Record<NoticeTone, { className: string; icon: React.ComponentType<{ className?: string }> }> = {
  info: { className: "border-info/25 bg-info/5 text-info", icon: InfoIcon },
  success: { className: "border-success/25 bg-success/5 text-success", icon: CircleCheckIcon },
  warning: { className: "border-warning/30 bg-warning/5 text-warning", icon: TriangleAlertIcon },
  danger: { className: "border-destructive/30 bg-destructive/5 text-destructive", icon: CircleAlertIcon },
}

export interface NoticeProps extends Omit<React.ComponentProps<typeof Alert>, "title" | "variant"> {
  tone?: NoticeTone
  /** Short headline. Optional: a one-sentence notice can be just `children`. */
  title?: React.ReactNode
  /** Buttons or links shown under the message, e.g. "Try again". */
  actions?: React.ReactNode
  /** Replace the tone icon, or pass `null` to hide it. */
  icon?: React.ReactNode
}

/**
 * Inline page/section message with a tone: info, success, warning, danger.
 *
 * Screen readers: `danger` and `warning` use `role="alert"` (interrupts),
 * `info` and `success` use `role="status"` (polite). Override with `role`.
 * Built on shadcn's Alert.
 */
function Notice({ tone = "info", title, actions, icon, role, className, children, ...props }: NoticeProps) {
  const { className: toneClassName, icon: ToneIcon } = tones[tone]
  return (
    <Alert
      data-slot="notice"
      data-tone={tone}
      role={role ?? (tone === "danger" || tone === "warning" ? "alert" : "status")}
      className={cn(toneClassName, className)}
      {...props}
    >
      {icon === undefined ? <ToneIcon /> : icon}
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {children || actions ? (
        <AlertDescription className="text-foreground/80">
          {children}
          {actions ? <div className="mt-2 flex flex-wrap items-center gap-2">{actions}</div> : null}
        </AlertDescription>
      ) : null}
    </Alert>
  )
}

export { Notice }
