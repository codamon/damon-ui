/**
 * NZ money formatting. Pure functions, no React, no Intl.
 *
 * Output is fixed to the NZ convention (`$1,234.56`, `-$400.00`) and never
 * depends on the runtime locale: a server whose default locale is es-ES would
 * otherwise render `1.234,56 $`, and users reconciling against bank or IRD
 * figures misread the amount.
 *
 * Amounts are handled as decimal strings and rounded with BigInt, never via
 * floating point. `Number("99999999999999.995").toFixed(2)` is already wrong.
 * Rounding is half away from zero (`15.015` → `15.02`, `-0.005` → `-0.01`),
 * matching `Decimal.ROUND_HALF_UP` and Postgres `round(numeric)`.
 */

export type MoneyValue = string | number | bigint | null | undefined

export interface FormatMoneyOptions {
  /** Shown for `null`, `undefined` and `""`. Default `"—"`. */
  empty?: string
  /** Currency symbol placed after the minus sign. Default `"$"`. */
  symbol?: string
}

const DECIMAL = /^(\d+(\.\d*)?|\.\d+)$/
// BigInt() calls, not bigint literals: Next apps default to an ES2017 target.
const ZERO = BigInt(0)
const ONE = BigInt(1)
const HUNDRED = BigInt(100)

/** Turn a JS number into a plain decimal string (no exponent). */
function numberToPlain(value: number): string {
  const text = String(value)
  if (!text.includes("e")) return text
  // >= 1e21 is always an integer in double precision; < 1e-6 needs fixed digits.
  return Math.abs(value) >= 1 ? BigInt(value).toString() : value.toFixed(10)
}

/**
 * Parse a decimal amount into integer cents, rounding half away from zero.
 * Returns `null` for empty or non-numeric input.
 *
 * Accepts plain decimals only (`"1234.5"`, `"-0.005"`, `12.3`, `BigInt(5)`). Strip
 * currency symbols and thousands separators before calling.
 *
 * @example toCents("15.015") // 1502n
 */
export function toCents(value: MoneyValue): bigint | null {
  if (value == null || value === "") return null
  if (typeof value === "bigint") return value * HUNDRED
  if (typeof value === "number" && !Number.isFinite(value)) return null

  const raw = typeof value === "number" ? numberToPlain(value) : value.trim()
  const negative = raw.startsWith("-")
  const absolute = negative || raw.startsWith("+") ? raw.slice(1) : raw
  if (!DECIMAL.test(absolute)) return null

  const [intPart = "", fracPart = ""] = absolute.split(".")
  const frac = (fracPart + "000").slice(0, 3)
  // Comparing single digit characters is a code-point comparison, not a float.
  let cents = BigInt(intPart || "0") * HUNDRED + BigInt(frac.slice(0, 2))
  if (frac[2] >= "5") cents += ONE

  return negative ? -cents : cents
}

/**
 * Format integer cents as NZ dollars.
 *
 * @example formatCents(123456) // "$1,234.56"
 * @example formatCents(BigInt(-40000)) // "-$400.00"
 */
export function formatCents(
  cents: number | bigint | null | undefined,
  options: FormatMoneyOptions = {}
): string {
  const { empty = "—", symbol = "$" } = options
  if (cents == null) return empty
  if (typeof cents === "number") {
    if (!Number.isFinite(cents)) return empty
    cents = BigInt(Math.sign(cents) * Math.round(Math.abs(cents)))
  }

  const negative = cents < ZERO
  const digits = (negative ? -cents : cents).toString().padStart(3, "0")
  const whole = digits.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return `${negative ? "-" : ""}${symbol}${whole}.${digits.slice(-2)}`
}

/**
 * Format a decimal amount as NZ dollars, rounded to cents.
 * Non-numeric strings are returned unchanged so bad data stays visible.
 *
 * @example formatMoney("1234.5600") // "$1,234.56"
 * @example formatMoney(-400) // "-$400.00"
 * @example formatMoney(null) // "—"
 */
export function formatMoney(value: MoneyValue, options: FormatMoneyOptions = {}): string {
  if (value == null || value === "") return options.empty ?? "—"
  const cents = toCents(value)
  if (cents === null) return String(value)
  return formatCents(cents, options)
}

/**
 * Stored amount → value for an `<input>`. Trims trailing zeros but keeps at
 * least two decimals, and never rounds: an untouched edit must submit the
 * exact stored value (`"115.1234"` stays `"115.1234"`).
 *
 * @example moneyInputValue("230.0000") // "230.00"
 */
export function moneyInputValue(stored: string | null | undefined): string {
  if (stored == null || stored === "") return ""
  const [whole, fraction = ""] = stored.split(".")
  const trimmed = fraction.replace(/0+$/, "")
  return `${whole || "0"}.${trimmed.length < 2 ? trimmed.padEnd(2, "0") : trimmed}`
}

export interface FormatPercentOptions {
  /** Shown for `null`, `undefined` and `""`. Default `"—"`. */
  empty?: string
  /** Maximum fraction digits; trailing zeros are dropped. Default `2`. */
  maxDecimals?: number
}

/**
 * Ratio (0–1) → percentage. Fixes float noise at a set precision, so `0.3`
 * renders `30%`, not `30.000000000000004%`.
 *
 * @example formatPercent("0.155") // "15.5%"
 */
export function formatPercent(
  ratio: string | number | null | undefined,
  options: FormatPercentOptions = {}
): string {
  const { empty = "—", maxDecimals = 2 } = options
  if (ratio == null || ratio === "") return empty
  const n = Number(ratio)
  if (Number.isNaN(n)) return String(ratio)
  return `${parseFloat((n * 100).toFixed(maxDecimals))}%`
}

/**
 * File size in B / KB / MB / GB (1024 based, English units).
 *
 * @example formatBytes(1536 * 1024) // "1.5 MB"
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}
