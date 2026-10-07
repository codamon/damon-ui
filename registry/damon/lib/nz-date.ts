/**
 * NZ dates without timezone bugs.
 *
 * Two kinds of value, kept apart on purpose:
 *
 * - **Calendar dates** (`"2026-03-31"`): due dates, invoice dates, tax dates,
 *   bookings. They have no time or zone. These helpers never put them through
 *   `Date`, so a server in UTC and a browser in Auckland get the same answer.
 * - **Instants** (ISO timestamps, `Date`, epoch ms): when something happened.
 *   They are converted to NZ local time with an explicit `Pacific/Auckland`
 *   zone and an explicit locale, never the process defaults.
 *
 * `new Date().toISOString().slice(0, 10)` is the classic bug this replaces:
 * that is the UTC date, which in NZ is still "yesterday" until 12 or 1pm.
 */

export const NZ_TIME_ZONE = "Pacific/Auckland"

/** `YYYY-MM-DD` calendar date. */
export type CivilDate = string

export type Instant = string | number | Date

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/** Days in a month (`month` is 1–12). */
export function daysInMonth(year: number, month: number): number {
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? Number.NaN
}

function parts(date: CivilDate): [number, number, number] | null {
  const m = ISO_DATE.exec(date)
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  return mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo) ? [y, mo, d] : null
}

/** True for a real `YYYY-MM-DD` date (`"2026-02-30"` is false). */
export function isCivilDate(value: unknown): value is CivilDate {
  return typeof value === "string" && parts(value) !== null
}

function mustParse(date: CivilDate): [number, number, number] {
  const p = parts(date)
  if (!p) throw new RangeError(`Expected a YYYY-MM-DD calendar date, received: ${JSON.stringify(date)}`)
  return p
}

const pad = (n: number, width = 2) => String(n).padStart(width, "0")

// Day-number round trip (Howard Hinnant's days_from_civil / civil_from_days):
// integer maths only, independent of the host timezone.
function toDayNumber(date: CivilDate): number {
  const [year, m, d] = mustParse(date)
  const y = year - (m <= 2 ? 1 : 0)
  const era = Math.floor(y / 400)
  const yoe = y - era * 400
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy
  return era * 146097 + doe - 719468
}

function fromDayNumber(days: number): CivilDate {
  const z = days + 719468
  const era = Math.floor(z / 146097)
  const doe = z - era * 146097
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365)
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100))
  const mp = Math.floor((5 * doy + 2) / 153)
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1
  const m = mp + (mp < 10 ? 3 : -9)
  return `${pad(yoe + era * 400 + (m <= 2 ? 1 : 0), 4)}-${pad(m)}-${pad(d)}`
}

/** Calendar date `days` later (negative for earlier). */
export function addDays(date: CivilDate, days: number): CivilDate {
  return fromDayNumber(toDayNumber(date) + days)
}

/** Whole days from `b` to `a` (positive when `a` is later). */
export function differenceInDays(a: CivilDate, b: CivilDate): number {
  return toDayNumber(a) - toDayNumber(b)
}

/** Day of week, 0 = Sunday … 6 = Saturday. */
export function weekdayOf(date: CivilDate): number {
  // 1970-01-01 (day 0) was a Thursday.
  return (((toDayNumber(date) + 4) % 7) + 7) % 7
}

export interface NzDateTimeParts {
  date: CivilDate
  hour: number
  minute: number
}

/** NZ local date, hour and minute of an instant. */
export function nzDateTimeParts(instant: Instant): NzDateTimeParts {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: NZ_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    // Explicit h23: hour12:false alone renders midnight as "24" on some ICU builds.
    hourCycle: "h23",
  }).formatToParts(new Date(instant))
  const get = (type: Intl.DateTimeFormatPartTypes) => p.find((x) => x.type === type)?.value ?? ""
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  }
}

/** NZ calendar date of an instant (`"2026-09-05T13:30:00Z"` → `"2026-09-06"`). */
export function nzDateOf(instant: Instant): CivilDate {
  return nzDateTimeParts(instant).date
}

/** Today's calendar date in New Zealand. Pass `now` in tests. */
export function todayInNz(now: Instant = Date.now()): CivilDate {
  return nzDateOf(now)
}

export interface FormatNzDateOptions {
  /** Prefix the weekday: `"Wed 7 Oct 2026"`. Default `false`. */
  weekday?: boolean
  /** Include the year. Default `true`. */
  year?: boolean
  /** Shown for empty input. Default `"—"`. */
  empty?: string
}

/**
 * Calendar date → `"7 Oct 2026"`. English month names regardless of locale,
 * so a date reads the same for every user. Invalid strings are returned as-is.
 */
export function formatNzDate(date: CivilDate | null | undefined, options: FormatNzDateOptions = {}): string {
  const { weekday = false, year = true, empty = "—" } = options
  if (!date) return empty
  const p = parts(date)
  if (!p) return date
  const text = `${p[2]} ${MONTHS[p[1] - 1]}${year ? ` ${p[0]}` : ""}`
  return weekday ? `${WEEKDAYS[weekdayOf(date)]} ${text}` : text
}

/** Instant → `"17 Sep 2026, 14:05"` in NZ time, 24-hour clock. */
export function formatNzDateTime(instant: Instant | null | undefined, options: { empty?: string } = {}): string {
  if (instant == null || instant === "") return options.empty ?? "—"
  const { date, hour, minute } = nzDateTimeParts(instant)
  return `${formatNzDate(date)}, ${pad(hour)}:${pad(minute)}`
}

/**
 * NZ tax year a date falls in, named by the year it ends: 1 April 2026 to
 * 31 March 2027 is the **2027** tax year.
 */
export function nzTaxYear(date: CivilDate): number {
  const [y, m] = mustParse(date)
  return m >= 4 ? y + 1 : y
}

/** First and last day of an NZ tax year (`2027` → 2026-04-01 … 2027-03-31). */
export function nzTaxYearRange(taxYear: number): { start: CivilDate; end: CivilDate } {
  return { start: `${pad(taxYear - 1, 4)}-04-01`, end: `${pad(taxYear, 4)}-03-31` }
}
