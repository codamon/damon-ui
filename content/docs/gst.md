# GST

NZ GST maths and GST-number validation: split GST-inclusive prices, add GST to exclusive ones, check a supplier's GST figure, validate an IRD/GST number. Exact BigInt arithmetic, no floats, no dependencies.

```bash
npx shadcn add @damon/gst
```

Installs `lib/gst.ts`. Pairs with `@damon/nz-money` for display.

## When to use

- Showing "incl. GST" / "excl. GST" breakdowns on quotes, invoices, carts and receipts.
- Calculating the GST component of an expense or receipt.
- Checking that a supplier invoice (or OCR output) has GST that matches its subtotal.
- Validating a GST number on a supplier, customer or registration form.

## When NOT to use

- Tax returns, apportionment, second-hand goods or asset adjustments. This covers price arithmetic, not GST law.
- Other countries' VAT/GST rules. The default rate is NZ's 15%; the rate argument is generic, but number validation is NZ only.
- Display formatting. These return plain `"15.00"` strings; format them with `formatMoney` from `@damon/nz-money`.

## API

`Amount` = decimal string or number. All money results are 2-decimal strings. `rate` defaults to `NZ_GST_RATE` (`"0.15"`).

| Function | Signature | Example |
|---|---|---|
| `splitInclusive` | `(gross, rate?) => { gross, net, gst }` | `"49.99"` → `{ gross: "49.99", net: "43.47", gst: "6.52" }` |
| `gstFromInclusive` | `(gross, rate?) => string` | `"115"` → `"15.00"` (× 3/23) |
| `netFromInclusive` | `(gross, rate?) => string` | `"115"` → `"100.00"` |
| `gstFromExclusive` | `(net, rate?) => string` | `"100"` → `"15.00"` |
| `inclusiveFromExclusive` | `(net, rate?) => string` | `"100"` → `"115.00"` |
| `isGstConsistent` | `({ subtotal, gst, rate?, tolerance? = "0.02" }) => boolean` | `{ subtotal: "100", gst: "15.01" }` → `true` |
| `hasGst` | `(amount) => boolean` | `"0.0000"` → `false`, `null` → `false` |
| `isValidGstNumber` | `(value) => boolean` | `"49-091-850"` → `true` |
| `normalizeGstNumber` | `(value) => string \| null` | `"GST 49 091 850"` → `"49091850"` |
| `formatGstNumber` | `(value) => string` | `"136410132"` → `"136-410-132"` |
| `NZ_GST_RATE` | `"0.15"` | |

## Minimal example

```tsx
import { splitInclusive } from "@/lib/gst"
import { formatMoney } from "@/lib/nz-money"

const { net, gst } = splitInclusive(product.price)
<p>{formatMoney(product.price)} <span className="text-muted-foreground">incl. {formatMoney(gst)} GST</span></p>
```

## Real example

Quote totals from GST-exclusive line items, plus supplier GST-number validation in a form action:

```tsx
import { gstFromExclusive, inclusiveFromExclusive, isValidGstNumber, normalizeGstNumber } from "@/lib/gst"
import { formatMoney } from "@/lib/nz-money"

const subtotal = quote.subtotal // "1234.50", a numeric column from the database

<dl className="grid grid-cols-2 tabular-nums">
  <dt>Subtotal</dt><dd className="text-right">{formatMoney(subtotal)}</dd>
  <dt>GST 15%</dt><dd className="text-right">{formatMoney(gstFromExclusive(subtotal))}</dd>
  <dt className="font-semibold">Total</dt><dd className="text-right font-semibold">{formatMoney(inclusiveFromExclusive(subtotal))}</dd>
</dl>

// server action
const gstNumber = normalizeGstNumber(formData.get("gstNumber") as string)
if (gstNumber && !isValidGstNumber(gstNumber)) return { errors: { gstNumber: "That GST number doesn't pass the IRD check." } }
```

## Constraints

- Money goes in as strings where possible. Numbers are accepted but have already lost precision past ~15 digits.
- Inputs are rounded to cents first, then GST is computed from the cents. Rounding is half away from zero.
- Inclusive splits derive `net = gross − gst`, so the three figures always add up. Across 0.01–200.00 at 15% this equals rounding net independently (tested).
- Invalid amounts throw `RangeError`; they are never treated as zero. A negative rate throws.
- GST-number validation follows Inland Revenue's 2026–27 spec: 8–9 digits, range 10,000,000–200,000,000, mod-11 with secondary weights. It checks the format only and doesn't confirm the number is registered.
- The rate is a constant. If NZ ever changes it, pass the right rate for the transaction date instead of editing the constant.
