# Confirm dialog

A second confirmation for irreversible actions: delete, cancel a paid order, revoke access. It submits the surrounding form (so server actions work) or runs an async `onConfirm` with pending and error states. Built on shadcn's `AlertDialog`.

```bash
npx shadcn add @damon/confirm-dialog
```

Installs `components/ui/confirm-dialog.tsx` and shadcn's `alert-dialog`, `button` if missing.

## When to use

- Deleting records, cancelling paid items, revoking invites: anything that destroys data or has side effects people don't expect.
- Inside a `<form action={serverAction}>` where the confirm button must still submit that form, even though the dialog is portalled out of it.
- Client-side calls that can fail, where the dialog should stay open and show the error.

## When NOT to use

- Reversible actions. Do it, then offer "Undo" in a toast. Confirming everything trains people to click OK without reading.
- Collecting input (rename, reason for refund). Use shadcn `Dialog` with a form.
- `window.confirm()` replacements that only say "Are you sure?". Say what will happen, or don't ask.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `trigger` | `ReactElement` | required | Usually a `<Button>`. Rendered via `asChild`. |
| `title` | `ReactNode` | required | Action + object: "Delete invoice INV-026?" |
| `description` | `ReactNode` | | Consequences: "The payment record and PDF are deleted too." |
| `confirmLabel` | `ReactNode` | required | A verb phrase, never "OK". |
| `cancelLabel` | `ReactNode` | `"Cancel"` | Focused by default (the safe choice). |
| `tone` | `"destructive" \| "default"` | `"destructive"` | Destructive shows a warning icon and red confirm button. |
| `onConfirm` | `() => unknown` | | Omit to `requestSubmit()` the trigger's enclosing `<form>`. Return a promise to show a spinner; a rejection shows `error.message` and keeps the dialog open. |
| `open`, `onOpenChange` | | | Optional controlled mode. |
| `children` | `ReactNode` | | Extra content above the buttons. |

## Minimal example

```tsx
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

<form action={deleteInvoice}>
  <input type="hidden" name="id" value={invoice.id} />
  <ConfirmDialog
    trigger={<Button variant="destructive">Delete</Button>}
    title={`Delete invoice ${invoice.number}?`}
    description="Its payments and PDF are deleted too. Reports for this period will change."
    confirmLabel="Delete invoice"
  />
</form>
```

## Real example

Async client call with error handling and a summary of what's affected:

```tsx
"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatMoney } from "@/lib/nz-money"

export function CancelOrderButton({ order }: { order: Order }) {
  const router = useRouter()
  return (
    <ConfirmDialog
      trigger={<Button variant="outline">Cancel order</Button>}
      title={`Cancel order ${order.number}?`}
      description="The customer is refunded and notified by email."
      confirmLabel="Cancel and refund"
      cancelLabel="Keep order"
      onConfirm={async () => {
        const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" })
        if (!res.ok) throw new Error("The payment provider didn't accept the refund. Nothing was changed.")
        router.refresh()
      }}
    >
      <dl className="grid grid-cols-2 gap-1 rounded-md bg-muted p-3 text-sm">
        <dt className="text-muted-foreground">Refund</dt>
        <dd className="text-right tabular-nums">{formatMoney(order.total)}</dd>
      </dl>
    </ConfirmDialog>
  )
}
```

## Constraints

- The dialog can't be closed (Escape, Cancel, overlay) while `onConfirm` is pending, so a request can't be orphaned mid-flight.
- Form mode uses `requestSubmit()`, so native validation and `useFormStatus` work. To send an intent value, put a hidden input in the form; the trigger is not the submitter.
- Without `onConfirm` and without an enclosing form, confirming does nothing but close. That's a bug in the caller.
- Client component. Uses shadcn `AlertDialog` (Radix), which traps focus and focuses Cancel first.
