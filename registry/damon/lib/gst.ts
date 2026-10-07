/**
 * NZ GST helpers. Pure TypeScript, exact arithmetic (BigInt rationals), no
 * floats and no dependencies.
 *
 * Amounts go in as decimal strings or numbers and come out as 2-decimal
 * strings (`"15.00"`), ready for `formatMoney` from `@damon/nz-money`.
 * Rounding to cents is half away from zero, matching `ROUND_HALF_UP`.
 *
 * Inputs are rounded to cents first, then GST is computed from the cents.
 * Inclusive splits derive net as `gross − gst`, so the three numbers always
 * reconcile. (Rounding net and GST independently can be 1c off the total.)
 */

/** NZ GST rate since 1 October 2010. */
export const NZ_GST_RATE = "0.15"

export type Amount = string | number

// BigInt() calls, not bigint literals: Next apps default to an ES2017 target.
const ZERO = BigInt(0)
const ONE = BigInt(1)
const TWO = BigInt(2)
const TEN = BigInt(10)
const HUNDRED = BigInt(100)

/** Exact rational n/d with d > 0. */
type Ratio = [bigint, bigint]

const DECIMAL = /^([+-])?(\d+)?(?:\.(\d+))?$/

function ratio(value: Amount, label: string): Ratio {
  const text = typeof value === "number" ? numberToPlain(value, label) : value.trim()
  const m = DECIMAL.exec(text)
  if (!m || (m[2] === undefined && m[3] === undefined)) {
    throw new RangeError(`${label} must be a decimal amount, received: ${JSON.stringify(value)}`)
  }
  const fraction = m[3] ?? ""
  const n = BigInt((m[2] ?? "0") + fraction) * (m[1] === "-" ? -ONE : ONE)
  return [n, TEN ** BigInt(fraction.length)]
}

function numberToPlain(value: number, label: string): string {
  if (!Number.isFinite(value)) throw new RangeError(`${label} must be finite, received: ${value}`)
  const text = String(value)
  return text.includes("e") ? value.toFixed(10) : text
}

/** Round n/d to the nearest integer, half away from zero. */
function roundDiv(n: bigint, d: bigint): bigint {
  const negative = n < ZERO !== d < ZERO
  const [a, b] = [n < ZERO ? -n : n, d < ZERO ? -d : d]
  const q = (TWO * a + b) / (TWO * b)
  return negative ? -q : q
}

function toCents([n, d]: Ratio): bigint {
  return roundDiv(n * HUNDRED, d)
}

function centsToString(cents: bigint): string {
  const negative = cents < ZERO
  const digits = (negative ? -cents : cents).toString().padStart(3, "0")
  return `${negative ? "-" : ""}${digits.slice(0, -2)}.${digits.slice(-2)}`
}

function rate(value: Amount): Ratio {
  const r = ratio(value, "GST rate")
  if (r[0] < ZERO) throw new RangeError(`GST rate must not be negative, received: ${value}`)
  return r
}

/** GST cents in a GST-inclusive amount of `grossCents`: gross × r / (1 + r). */
function gstCentsInInclusive(grossCents: bigint, gstRate: Amount): bigint {
  const [rn, rd] = rate(gstRate)
  return roundDiv(grossCents * rn, rd + rn)
}

/** GST cents on a GST-exclusive amount of `netCents`: net × r. */
function gstCentsOnExclusive(netCents: bigint, gstRate: Amount): bigint {
  const [rn, rd] = rate(gstRate)
  return roundDiv(netCents * rn, rd)
}

const grossCentsOf = (gross: Amount) => toCents(ratio(gross, "Gross amount"))
const netCentsOf = (net: Amount) => toCents(ratio(net, "Net amount"))

/**
 * GST contained in a GST-inclusive price (15%: × 3/23).
 * @example gstFromInclusive("115") // "15.00"
 */
export function gstFromInclusive(gross: Amount, gstRate: Amount = NZ_GST_RATE): string {
  return centsToString(gstCentsInInclusive(grossCentsOf(gross), gstRate))
}

/**
 * GST-exclusive amount of a GST-inclusive price (`gross − gst`).
 * @example netFromInclusive("115") // "100.00"
 */
export function netFromInclusive(gross: Amount, gstRate: Amount = NZ_GST_RATE): string {
  const grossCents = grossCentsOf(gross)
  return centsToString(grossCents - gstCentsInInclusive(grossCents, gstRate))
}

/**
 * GST to add on top of a GST-exclusive amount.
 * @example gstFromExclusive("100") // "15.00"
 */
export function gstFromExclusive(net: Amount, gstRate: Amount = NZ_GST_RATE): string {
  return centsToString(gstCentsOnExclusive(netCentsOf(net), gstRate))
}

/**
 * GST-inclusive total for a GST-exclusive amount (`net + gst`).
 * @example inclusiveFromExclusive("100") // "115.00"
 */
export function inclusiveFromExclusive(net: Amount, gstRate: Amount = NZ_GST_RATE): string {
  const netCents = netCentsOf(net)
  return centsToString(netCents + gstCentsOnExclusive(netCents, gstRate))
}

export interface GstSplit {
  gross: string
  net: string
  gst: string
}

/**
 * Split a GST-inclusive price into gross, net and GST. `net + gst === gross`.
 * @example splitInclusive("49.99") // { gross: "49.99", net: "43.47", gst: "6.52" }
 */
export function splitInclusive(gross: Amount, gstRate: Amount = NZ_GST_RATE): GstSplit {
  const grossCents = grossCentsOf(gross)
  const gstCents = gstCentsInInclusive(grossCents, gstRate)
  return {
    gross: centsToString(grossCents),
    net: centsToString(grossCents - gstCents),
    gst: centsToString(gstCents),
  }
}

/**
 * Does a stated GST figure match the subtotal at the rate, within a tolerance?
 * For checking supplier invoices or OCR output. Default tolerance 2c.
 *
 * @example isGstConsistent({ subtotal: "100", gst: "15.01" }) // true
 */
export function isGstConsistent(input: {
  subtotal: Amount
  gst: Amount
  rate?: Amount
  tolerance?: Amount
}): boolean {
  const { subtotal, gst, rate: gstRate = NZ_GST_RATE, tolerance = "0.02" } = input
  const [sn, sd] = ratio(subtotal, "Subtotal")
  const [rn, rd] = rate(gstRate)
  const [gn, gd] = ratio(gst, "GST")
  const [tn, td] = ratio(tolerance, "Tolerance")
  // |gst − subtotal × r| ≤ tolerance, compared exactly over a common denominator.
  const diff = gn * sd * rd * td - sn * rn * gd * td
  return (diff < ZERO ? -diff : diff) <= tn * sd * rd * gd
}

/**
 * True when an amount is present and not zero (`"0.0000"`, `" 0 "` and
 * `null` are false). Text check only; never parses through a float.
 */
export function hasGst(amount: string | number | null | undefined): boolean {
  if (amount == null) return false
  return !/^[+-]?0*(\.0*)?$/.test(String(amount).trim())
}

const PRIMARY_WEIGHTS = [3, 2, 7, 6, 5, 4, 3, 2]
const SECONDARY_WEIGHTS = [7, 4, 3, 2, 5, 2, 7, 6]

/**
 * Digits of a GST/IRD number as typed or printed (`"GST 49-091-850"` →
 * `"49091850"`). `null` when there are no digits, more than nine, or
 * punctuation a GST number never carries (anything other than spaces,
 * `-`, `.`, `/` and letters such as the "GST" label).
 */
export function normalizeGstNumber(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null
  let digits = ""
  for (const c of value) {
    if (c >= "0" && c <= "9") digits += c
    // Letter test without \p{L}: Unicode property escapes need an ES2018 target.
    else if (!/[\s\-./]/.test(c) && c.toLowerCase() === c.toUpperCase()) return null
  }
  return digits.length >= 1 && digits.length <= 9 ? digits : null
}

function checkDigit(padded: string, weights: number[]): number {
  let sum = 0
  for (let i = 0; i < 8; i++) sum += Number(padded[i]) * weights[i]
  const remainder = sum % 11
  return remainder === 0 ? 0 : 11 - remainder
}

/**
 * Validate an NZ GST number (same as the IRD number): 8–9 digits, between
 * 10,000,000 and 200,000,000, mod-11 check digit with IRD's secondary
 * weighting. Accepts formatted input (`"49-091-850"`).
 *
 * Source: Inland Revenue payroll specification 2026–27, §6.1.
 */
export function isValidGstNumber(value: string | null | undefined): boolean {
  const digits = normalizeGstNumber(value)
  if (!digits || digits.length < 8) return false
  const padded = digits.padStart(9, "0")
  const number = Number(padded)
  if (number < 10_000_000 || number > 200_000_000) return false
  let check = checkDigit(padded, PRIMARY_WEIGHTS)
  if (check === 10) {
    check = checkDigit(padded, SECONDARY_WEIGHTS)
    if (check === 10) return false
  }
  return check === Number(padded[8])
}

/**
 * Display form: `"49-091-850"`, `"136-410-132"`. Returns the input unchanged
 * when it does not normalise to 8 or 9 digits.
 */
export function formatGstNumber(value: string): string {
  const digits = normalizeGstNumber(value)
  if (!digits || digits.length < 8) return value
  return `${digits.slice(0, -6)}-${digits.slice(-6, -3)}-${digits.slice(-3)}`
}
