import * as React from "react"
import { CircleAlertIcon, InboxIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface ResourceStateProps extends Omit<React.ComponentProps<typeof Empty>, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  /** Icon element shown in a muted tile. */
  icon?: React.ReactNode
  /** Buttons/links: the next step. */
  action?: React.ReactNode
  /** Small print under the description: a reassurance, a reference id. */
  detail?: React.ReactNode
}

/** Base layout for empty, error and permission states. Built on shadcn's Empty. */
function ResourceState({ title, description, icon, action, detail, className, ...props }: ResourceStateProps) {
  return (
    <Empty data-slot="resource-state" className={cn("py-10", className)} {...props}>
      <EmptyHeader>
        {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action || detail ? (
        <EmptyContent>
          {action ? <div className="flex flex-wrap justify-center gap-2">{action}</div> : null}
          {detail ? <div className="text-xs text-muted-foreground">{detail}</div> : null}
        </EmptyContent>
      ) : null}
    </Empty>
  )
}

export interface EmptyStateProps extends Omit<ResourceStateProps, "icon"> {
  /** Default: an inbox icon. Pass `null` for none. */
  icon?: React.ReactNode
}

/**
 * Nothing here yet. Say what will appear and offer the action that creates it.
 * For "no results for these filters", say so and offer to clear the filters.
 */
function EmptyState({ icon, ...props }: EmptyStateProps) {
  return <ResourceState data-state="empty" icon={icon === undefined ? <InboxIcon /> : icon} {...props} />
}

export interface ErrorStateProps extends Omit<ResourceStateProps, "title"> {
  /** Default `"This couldn't be loaded"`. */
  title?: React.ReactNode
  /** Shows a "Try again" button. Ignored when `action` is set. */
  onRetry?: () => void
  retryLabel?: string
  /** Request or error id to quote to support, shown in monospace. */
  reference?: string
}

/** Failed to load. `role="alert"`, an error icon, a retry, and an optional reference id. */
function ErrorState({
  title = "This couldn't be loaded",
  onRetry,
  retryLabel = "Try again",
  reference,
  action,
  detail,
  ...props
}: ErrorStateProps) {
  return (
    <ResourceState
      data-state="error"
      role="alert"
      icon={<CircleAlertIcon className="text-destructive" />}
      title={title}
      action={
        action ??
        (onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : undefined)
      }
      detail={
        detail || reference ? (
          <>
            {detail}
            {detail && reference ? " " : null}
            {reference ? <span className="font-mono">Reference: {reference}</span> : null}
          </>
        ) : undefined
      }
      {...props}
    />
  )
}

export interface LoadingStateProps extends React.ComponentProps<"div"> {
  /** Shape of the content that is coming. Matching the real layout makes the wait feel shorter. */
  variant?: "table" | "cards" | "list"
  rows?: number
  /** Announced to screen readers. Default `"Loading"`. */
  label?: string
}

// Varying widths so the skeleton reads as content, not as a different control.
const cellWidths = ["w-3/5", "w-4/5", "w-2/5", "w-1/2"]

/** Skeleton placeholder shaped like a table, card grid or list. */
function LoadingState({ variant = "table", rows = 5, label = "Loading", className, ...props }: LoadingStateProps) {
  const indexes = Array.from({ length: Math.max(1, rows) }, (_, i) => i)
  return (
    <div
      data-slot="loading-state"
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn("w-full", className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {variant === "table" ? (
        <div className="divide-y rounded-lg border">
          <div className="flex gap-4 bg-muted/40 px-4 py-3">
            {[3, 2, 2, 1].map((flex, i) => (
              <Skeleton key={i} className="h-3" style={{ flex }} />
            ))}
          </div>
          {indexes.map((row) => (
            <div key={row} className="flex items-center gap-4 px-4 py-3.5">
              <div className="flex-[3]">
                <Skeleton className={cn("h-3.5", cellWidths[row % 4])} />
              </div>
              <div className="flex-[2]">
                <Skeleton className={cn("h-3.5", cellWidths[(row + 1) % 4])} />
              </div>
              <div className="flex-[2]">
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex flex-1 justify-end">
                <Skeleton className="h-3.5 w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : variant === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {indexes.map((card) => (
            <div key={card} className="space-y-3 rounded-lg border p-4">
              <Skeleton className={cn("h-4", cellWidths[card % 4])} />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {indexes.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className={cn("h-3.5", cellWidths[item % 4])} />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { EmptyState, ErrorState, LoadingState, ResourceState }
