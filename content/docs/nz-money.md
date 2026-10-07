# NZ money

Format NZD amounts the same way everywhere: `$1,234.56`, `-$400.00`, `—` for empty. Pure TypeScript, no Intl, no floats on the money path.

```bash
npx shadcn add @damon/nz-money
```

Installs `lib/nz-money.ts`. No dependencies.

## When to use

- Displaying money that users compare against bank statements, invoices or IRD figures.
- Amounts stored as `numeric`/decimal strings (Postgres `numeric(18,4)`, Prisma `Decimal`, API strings).
- Amounts stored as integer cents (Stripe, most checkout code) → `formatCents`.
- Pre-filling an `<input>` from a stored amount without silently rounding it → `moneyInputValue`.

## When NOT to use

- Multi-currency UIs. This is NZD-style output (`$` symbol, `,` thousands, `.` decimal). For EUR/JPY use `Intl.NumberFormat` with an explicit locale and currency.
- Calculating money. These are display helpers; do arithmetic in integer cents or a decimal library. GST maths lives in `@damon/gst`.
- Localised number display for a non-NZ audience who expect their own separators.

## API

| Function | Signature | Notes |
|---|---|---|
| `formatMoney` | `(value: string \| number \| bigint \| null \| undefined, options?) => string` | Rounds to cents, half away from zero. Non-numeric strings are returned unchanged. |
| `formatCents` | `(cents: number \| bigint \| null \| undefined, options?) => string` | Integer cents → dollars. Fractional cents are rounded. |
| `toCents` | `(value) => bigint \| null` | Strict decimal parse (`"12.5"`, `"-0.005"`, `+3`). Returns `null` for `"$5"` or `"1,000"`. |
| `moneyInputValue` | `(stored: string \| null \| undefined) => string` | `"230.0000"` → `"230.00"`, `"115.1234"` stays `"115.1234"`. Never rounds. |
| `formatPercent` | `(ratio, { empty?, maxDecimals? = 2 }) => string` | Ratio 0–1 → `"15.5%"`. |
| `formatBytes` | `(bytes: number) => string` | `"512 B"`, `"2 KB"`, `"1.5 MB"`, `"3.0 GB"`. |

`options` for `formatMoney` / `formatCents`: `{ empty?: string = "—", symbol?: string = "$" }`.

## Minimal example

```tsx
import { formatMoney } from "@/lib/nz-money"

<td className="text-right tabular-nums">{formatMoney(invoice.total)}</td>
```

## Real example

```tsx
import { formatCents, formatMoney, moneyInputValue } from "@/lib/nz-money"

// Order summary: Stripe gives integer cents
<dl className="grid grid-cols-2 gap-2 tabular-nums">
  <dt>Subtotal</dt><dd className="text-right">{formatCents(order.subtotalCents)}</dd>
  <dt>Total</dt><dd className="text-right font-semibold">{formatCents(order.totalCents)}</dd>
</dl>

// Edit form: DB gives numeric(18,4) strings
<Input name="amount" inputMode="decimal" defaultValue={moneyInputValue(expense.amount)} />

// Report cell with a custom empty marker
<span>{formatMoney(row.refund, { empty: "No refund" })}</span>
```

## Constraints

- Output never depends on the runtime locale or timezone. Tests patch the default locale to es-ES to make sure.
- Pass decimal strings when you have them. A JS `number` is accepted, but it has already lost precision above about 15 significant digits.
- Rounding is half away from zero (`15.015` → `$15.02`, `15.025` → `$15.03`). That is not banker's rounding.
- `-0.004` formats as `$0.00`, never `-$0.00`.
- Use `tabular-nums` on columns of amounts so the digits line up.
