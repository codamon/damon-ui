# Labeled field

One component for a form row: label, control, help text and error, with the accessibility wiring done for you. Built on shadcn's `Field` primitives.

```bash
npx shadcn add @damon/labeled-field
```

Installs `components/ui/labeled-field.tsx` and shadcn's `field` (plus `label`, `separator`) if missing. Exports `LabeledField`, `FieldRow`, `FormActions`.

## When to use

- Any labelled input, textarea, select or combobox in an app form, when you'd otherwise hand-write `id` / `htmlFor` / `aria-describedby` pairs.
- Server-action forms that return field errors: pass `error={state.errors?.email}` and the control gets `aria-invalid` and the message is announced.
- Forms on wide pages: `width="sm"` keeps an amount or date input short instead of stretching to 1200px.

## When NOT to use

- Checkbox and radio rows, where the label sits beside the control. Use shadcn's `<Field orientation="horizontal">` directly.
- Grouped controls with a legend (radio groups, address blocks). Use shadcn's `FieldSet` + `FieldLegend`.
- react-hook-form projects that already use shadcn's `<Form>` / `<FormField>` wrappers. Don't mix the two.

## Props

`LabeledField`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `ReactNode` | required | |
| `children` | one `ReactElement` | required | The control. Receives `id`, `aria-describedby`, `aria-invalid`, `aria-required`. Existing values on the child win. |
| `description` | `ReactNode` | | Help text, linked via `aria-describedby`. |
| `error` | `ReactNode` | | Shown under the control (`role="alert"`), sets `aria-invalid`, turns the label destructive. |
| `required` | `boolean` | `false` | Visual `*` + `aria-required`. Add the `required` attribute to the control too if you want browser validation. |
| `width` | `"sm" \| "md" \| "full"` | `"full"` | `sm` = 11rem (amounts, dates), `md` = 28rem (names, emails). |
| `controlId` | `string` | generated | Used when the child has no `id`. |
| `orientation`, `className`, … | shadcn `Field` props | | Passed through. |

`FieldRow` — `columns?: 2 | 3` (default 2). One column on mobile.
`FormActions` — `align?: "start" | "end" | "between"` (default `start`).

## Minimal example

```tsx
import { Input } from "@/components/ui/input"
import { LabeledField } from "@/components/ui/labeled-field"

<LabeledField label="Email" description="We'll send the receipt here." required>
  <Input name="email" type="email" required />
</LabeledField>
```

## Real example

Server action form with returned errors:

```tsx
"use client"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldRow, FormActions, LabeledField } from "@/components/ui/labeled-field"
import { saveExpense } from "./actions"

export function ExpenseForm() {
  const [state, action, pending] = useActionState(saveExpense, { errors: {} })
  return (
    <form action={action} className="space-y-5">
      <FieldRow>
        <LabeledField label="Amount" width="sm" required error={state.errors.amount}>
          <Input name="amount" inputMode="decimal" required />
        </LabeledField>
        <LabeledField label="Date" width="sm" required error={state.errors.date}>
          <Input name="date" type="date" required />
        </LabeledField>
      </FieldRow>
      <LabeledField label="Notes" description="Optional. Visible to your accountant.">
        <Textarea name="notes" rows={3} />
      </LabeledField>
      <FormActions>
        <Button type="submit" disabled={pending}>Save expense</Button>
        <Button type="button" variant="ghost">Cancel</Button>
      </FormActions>
    </form>
  )
}
```

## Constraints

- Exactly one child element. It must accept `id` and `aria-*` props (all shadcn controls and native elements do). For shadcn `Select`, wrap the `SelectTrigger`, not the `Select` root.
- Client component (`"use client"`), because it uses `useId`. It can still be rendered from a server component.
- The description stays visible when there's an error, so put "must be…" rules in the description, not only in the error.
- Uses shadcn's `field` primitives. If your project has an older shadcn without `components/ui/field.tsx`, the CLI installs it.
