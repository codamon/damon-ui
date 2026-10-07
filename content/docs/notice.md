# Notice

An inline message in a page or section: info, success, warning or danger, with an optional title and actions. Built on shadcn's `Alert`, with the ARIA role chosen by tone.

```bash
npx shadcn add @damon/notice
```

Installs `components/ui/notice.tsx` and shadcn's `alert` if missing. Adds `--success`, `--warning`, `--info` tokens if they are missing.

## When to use

- Explaining a state that persists on the page: "GST registration missing, invoices won't show GST", "Read-only: this period is filed".
- Form-level errors from a server action ("Couldn't save. The invoice number is already used.").
- A success confirmation that should stay put after a redirect.

## When NOT to use

- Transient feedback after an action (saved, copied). Use a toast (shadcn `sonner`).
- A whole page or list that failed to load. Use `ErrorState` from `@damon/resource-state`.
- Field-level errors. Pass `error` to `@damon/labeled-field`.
- Decisions that need a yes/no. Use `@damon/confirm-dialog`.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `"info" \| "success" \| "warning" \| "danger"` | `"info"` | |
| `title` | `ReactNode` | | Short headline in the tone colour. |
| `children` | `ReactNode` | | The message. Can be the only content. |
| `actions` | `ReactNode` | | Buttons/links under the message. |
| `icon` | `ReactNode \| null` | tone icon | `null` hides it. |
| `role` | `string` | by tone | `danger`/`warning` → `alert`; `info`/`success` → `status`. |
| `className`, … | `div` props | | |

## Minimal example

```tsx
import { Notice } from "@/components/ui/notice"

<Notice tone="warning">This period is filed. Changes need an amendment.</Notice>
```

## Real example

Server action error with a retry and a link:

```tsx
import { Button } from "@/components/ui/button"
import { Notice } from "@/components/ui/notice"

{state.error ? (
  <Notice
    tone="danger"
    title="Couldn't send the invoice"
    actions={
      <>
        <Button size="sm" variant="outline" onClick={retry}>Try again</Button>
        <a href="/settings/email" className="text-sm underline underline-offset-4">Check email settings</a>
      </>
    }
  >
    The mail provider rejected the message ({state.error.code}). Nothing was sent to the customer.
  </Notice>
) : null}
```

## Constraints

- Say what happened and what it means for the user. Don't write only "Error".
- `role="alert"` interrupts screen readers. Keep `danger`/`warning` for things that need attention now; pass `role="status"` for a warning that's just context.
- Tones use `--success`, `--warning`, `--info`, `--destructive` at 5% fill and 25–30% border, so they work on `background` and `card` surfaces in both modes.
- Doesn't dismiss itself. If it should be dismissible, render it conditionally and put a close button in `actions`.
