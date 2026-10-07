"use client"

import * as React from "react"
import { Loader2Icon, TriangleAlertIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ConfirmDialogProps {
  /** The button that opens the dialog. Rendered as-is (`asChild`). */
  trigger: React.ReactElement
  /** Names the action and the object: "Delete invoice INV-026?" */
  title: React.ReactNode
  /** What else happens as a result. Not "This cannot be undone" on its own. */
  description?: React.ReactNode
  /** A verb that says what the user agrees to ("Delete invoice"), never "OK". */
  confirmLabel: React.ReactNode
  cancelLabel?: React.ReactNode
  /** `destructive` (default) for deletes and cancellations, `default` for weighty but safe actions. */
  tone?: "destructive" | "default"
  /**
   * Runs on confirm. Return a promise to keep the dialog open with a spinner
   * until it settles; a rejection shows its message and keeps it open.
   * Omit it to submit the `<form>` that contains the trigger instead.
   */
  onConfirm?: () => unknown
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Extra content between the description and the buttons (a summary list, a checkbox). */
  children?: React.ReactNode
  className?: string
}

/**
 * Second confirmation for irreversible actions, built on shadcn's AlertDialog.
 *
 * Inside a form it submits that form, even though the dialog is portalled
 * out of it: the trigger's enclosing form is found and `requestSubmit()`ed,
 * so server actions and native validation still run.
 */
function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "destructive",
  onConfirm,
  open: openProp,
  onOpenChange,
  children,
  className,
}: ConfirmDialogProps) {
  const [openState, setOpenState] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const open = openProp ?? openState

  const setOpen = (next: boolean) => {
    if (pending) return // never close mid-request
    if (next) setError(null)
    setOpenState(next)
    onOpenChange?.(next)
  }

  async function confirm() {
    if (!onConfirm) {
      triggerRef.current?.closest("form")?.requestSubmit()
      setOpen(false)
      return
    }
    setError(null)
    const result = onConfirm()
    if (!(result instanceof Promise)) {
      setOpen(false)
      return
    }
    setPending(true)
    try {
      await result
      setPending(false)
      setOpenState(false)
      onOpenChange?.(false)
    } catch (err) {
      setPending(false)
      setError(err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild ref={triggerRef}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent data-slot="confirm-dialog" className={className}>
        <AlertDialogHeader className="sm:flex sm:flex-row sm:items-start sm:gap-3 sm:text-left">
          {tone === "destructive" ? (
            <span
              aria-hidden="true"
              className="mx-auto mb-2 flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:mx-0 sm:mb-0"
            >
              <TriangleAlertIcon className="size-4" />
            </span>
          ) : null}
          <div className="grid gap-1.5">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
          </div>
        </AlertDialogHeader>
        {children}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "default"}
            disabled={pending}
            aria-busy={pending || undefined}
            onClick={confirm}
            className={cn(pending && "cursor-progress")}
          >
            {pending ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmDialog }
