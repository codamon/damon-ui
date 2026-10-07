# NZ date

Calendar dates and timestamps for New Zealand apps without timezone bugs: today in NZ, day arithmetic, `7 Oct 2026` formatting, NZ tax years. Pure TypeScript, no dependencies.

```bash
npx shadcn add @damon/nz-date
```

Installs `lib/nz-date.ts`.

## When to use

- A form default of "today" (invoice date, booking date) computed on a server that runs in UTC.
- Due dates and booking windows: `addDays(invoiceDate, 20)`, `differenceInDays(due, today)`.
- Showing when something happened (`17 Sep 2026, 14:05`) the same way for every user, whatever their browser locale.
- Working out which NZ tax year (ending 31 March) a date belongs to.

## When NOT to use

- Users in several countries who should see their own local time. This module is hard-wired to `Pacific/Auckland`.
- Recurring schedules, durations in hours across DST, or calendar UIs. Use `date-fns-tz` / Temporal for that.
- Localised long-form dates ("mercredi 7 octobre"). Month names here are always English abbreviations, on purpose.

## API

Two kinds of value: `CivilDate` = `"YYYY-MM-DD"` (no time, no zone) and `Instant` = ISO string, epoch ms or `Date`.

| Function | Signature | Notes |
|---|---|---|
| `todayInNz` | `(now?: Instant) => CivilDate` | Pass `now` in tests. |
| `nzDateOf` | `(instant: Instant) => CivilDate` | `"2026-09-05T13:30:00Z"` → `"2026-09-06"`. |
| `nzDateTimeParts` | `(instant: Instant) => { date, hour, minute }` | 24-hour, NZ local. |
| `addDays` | `(date: CivilDate, days: number) => CivilDate` | Integer maths, never goes through `Date`. |
| `differenceInDays` | `(a: CivilDate, b: CivilDate) => number` | Positive when `a` is later. |
| `weekdayOf` | `(date: CivilDate) => number` | 0 = Sunday. |
| `isCivilDate` | `(value: unknown) => value is CivilDate` | Rejects `2026-02-30` and timestamps. |
| `daysInMonth` | `(year, month) => number` | `month` is 1–12. |
| `formatNzDate` | `(date, { weekday?, year?, empty? }) => string` | `"7 Oct 2026"`, `"Wed 7 Oct"`. |
| `formatNzDateTime` | `(instant, { empty? }) => string` | `"17 Sep 2026, 14:05"`. |
| `nzTaxYear` | `(date: CivilDate) => number` | `2026-04-01` → `2027`. |
| `nzTaxYearRange` | `(taxYear: number) => { start, end }` | `2027` → `2026-04-01 … 2027-03-31`. |
| `NZ_TIME_ZONE` | `"Pacific/Auckland"` | |

## Minimal example

```tsx
import { formatNzDate, todayInNz } from "@/lib/nz-date"

<Input type="date" name="issuedOn" defaultValue={todayInNz()} />
<p>Issued {formatNzDate(invoice.issuedOn)}</p>
```

## Real example

```tsx
import { addDays, differenceInDays, formatNzDate, formatNzDateTime, todayInNz } from "@/lib/nz-date"

const today = todayInNz()
const due = addDays(invoice.issuedOn, 20)
const daysLeft = differenceInDays(due, today)

<dl>
  <dt>Due</dt>
  <dd>
    {formatNzDate(due, { weekday: true })}
    {daysLeft < 0 ? ` (${-daysLeft} days overdue)` : ` (in ${daysLeft} days)`}
  </dd>
  <dt>Last emailed</dt>
  <dd>{formatNzDateTime(invoice.lastSentAt, { empty: "Never" })}</dd>
</dl>
```

## Constraints

- Never write `new Date().toISOString().slice(0, 10)` for "today". That is the UTC date, which is yesterday in NZ until midday.
- Store calendar dates as `date` columns / `"YYYY-MM-DD"` strings and timestamps as `timestamptz` / ISO strings. Don't mix them.
- Calendar helpers throw `RangeError` on a timestamp (`"2026-03-31T00:00:00Z"`) instead of truncating it. Convert with `nzDateOf` first.
- Results don't depend on the host timezone or default locale. Tests run under UTC, Auckland, New York and Kiritimati, with the default locale patched to ja/es/zh.
- `formatNzDateTime` runs `Intl` on the server. If you render it in a client component, the server and client output match, because the zone is explicit.
