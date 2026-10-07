import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import {
  formatBytes,
  formatCents,
  formatMoney,
  formatPercent,
  moneyInputValue,
  toCents,
} from "@/registry/damon/lib/nz-money"

const SRC = readFileSync("registry/damon/lib/nz-money.ts", "utf8")

/** Run code as if the process default locale were es-ES. */
function withSpanishDefaultLocale<T>(run: () => T): T {
  const original = Number.prototype.toLocaleString
  Number.prototype.toLocaleString = function (locale, options) {
    return original.call(this, locale ?? "es-ES", options)
  }
  try {
    return run()
  } finally {
    Number.prototype.toLocaleString = original
  }
}

const VECTORS: ReadonlyArray<readonly [string, string]> = [
  ["1234.5600", "$1,234.56"],
  ["1234567.0000", "$1,234,567.00"],
  ["0.0000", "$0.00"],
  ["0.5000", "$0.50"],
  ["0012.5000", "$12.50"],
  [".5", "$0.50"],
  ["7", "$7.00"],
  // half-cent boundaries
  ["15.0149", "$15.01"],
  ["15.0150", "$15.02"],
  ["15.0250", "$15.03"], // half away from zero, not banker's
  ["0.0050", "$0.01"],
  ["0.0049", "$0.00"],
  // carry across integer and thousands separator
  ["9.9950", "$10.00"],
  ["999999.9950", "$1,000,000.00"],
  // negatives: one sign, before the symbol
  ["-400.0000", "-$400.00"],
  ["-15.0150", "-$15.02"],
  ["-0.0050", "-$0.01"],
  // beyond double precision
  ["90093856392849.0050", "$90,093,856,392,849.01"],
  ["99999999999999.9950", "$100,000,000,000,000.00"],
]

describe("formatMoney", () => {
  it.each(VECTORS)("%s → %s", (input, expected) => {
    expect(formatMoney(input)).toBe(expected)
  })

  it("handles empty and non-numeric input", () => {
    expect(formatMoney(null)).toBe("—")
    expect(formatMoney(undefined)).toBe("—")
    expect(formatMoney("")).toBe("—")
    expect(formatMoney("", { empty: "n/a" })).toBe("n/a")
    expect(formatMoney("not a number")).toBe("not a number")
    expect(formatMoney("1,234.00")).toBe("1,234.00")
  })

  it("accepts numbers and bigints", () => {
    expect(formatMoney(1234.5)).toBe("$1,234.50")
    expect(formatMoney(-400)).toBe("-$400.00")
    expect(formatMoney(1.005)).toBe("$1.01")
    expect(formatMoney(0.1 + 0.2)).toBe("$0.30")
    expect(formatMoney(BigInt(5))).toBe("$5.00")
    expect(formatMoney(1e21)).toBe("$1,000,000,000,000,000,000,000.00")
    expect(formatMoney(1e-7)).toBe("$0.00")
  })

  it("never prints negative zero", () => {
    expect(formatMoney("-0.0049")).toBe("$0.00")
    expect(formatMoney(-0)).toBe("$0.00")
  })

  it("supports a custom symbol", () => {
    expect(formatMoney("10", { symbol: "NZ$" })).toBe("NZ$10.00")
    expect(formatMoney("-10", { symbol: "" })).toBe("-10.00")
  })

  it("is unaffected by the process default locale", () => {
    expect(withSpanishDefaultLocale(() => formatMoney("1234567.5"))).toBe("$1,234,567.50")
    // fixture self-check: the patch really changes default-locale output
    expect(withSpanishDefaultLocale(() => (1234.5).toLocaleString())).not.toBe(
      (1234.5).toLocaleString("en-NZ")
    )
  })

  it("uses no locale-sensitive or float APIs on the string path", () => {
    for (const name of ["toCents", "formatCents"]) {
      const body = new RegExp(`export function ${name}\\([\\s\\S]*?\\n\\}`).exec(SRC)?.[0] ?? ""
      expect(body).not.toBe("")
      for (const forbidden of ["toLocaleString", "Intl.", "parseFloat", "toFixed"]) {
        expect(body, `${name} must not use ${forbidden}`).not.toContain(forbidden)
      }
    }
  })
})

describe("toCents", () => {
  it("rounds half away from zero", () => {
    expect(toCents("15.015")).toBe(BigInt(1502))
    expect(toCents("-15.015")).toBe(BigInt(-1502))
    expect(toCents("+3.1")).toBe(BigInt(310))
    expect(toCents(" 2.50 ")).toBe(BigInt(250))
  })
  it("rejects junk", () => {
    expect(toCents("")).toBeNull()
    expect(toCents(null)).toBeNull()
    expect(toCents("$5")).toBeNull()
    expect(toCents("1.2.3")).toBeNull()
    expect(toCents(Number.NaN)).toBeNull()
    expect(toCents(Number.POSITIVE_INFINITY)).toBeNull()
  })
})

describe("formatCents", () => {
  it("formats integer cents", () => {
    expect(formatCents(123456)).toBe("$1,234.56")
    expect(formatCents(5)).toBe("$0.05")
    expect(formatCents(0)).toBe("$0.00")
    expect(formatCents(BigInt(-40000))).toBe("-$400.00")
    expect(formatCents(null)).toBe("—")
  })
  it("rounds fractional cents half away from zero", () => {
    expect(formatCents(10.5)).toBe("$0.11")
    expect(formatCents(-10.5)).toBe("-$0.11")
  })
})

describe("moneyInputValue", () => {
  it("trims zeros without rounding", () => {
    expect(moneyInputValue("230.0000")).toBe("230.00")
    expect(moneyInputValue("115.1234")).toBe("115.1234")
    expect(moneyInputValue("115.1200")).toBe("115.12")
    expect(moneyInputValue("12.5")).toBe("12.50")
    expect(moneyInputValue("12")).toBe("12.00")
    expect(moneyInputValue("")).toBe("")
    expect(moneyInputValue(null)).toBe("")
  })
})

describe("formatPercent", () => {
  it("avoids float noise", () => {
    expect(formatPercent("0.3")).toBe("30%")
    expect(formatPercent(0.155)).toBe("15.5%")
    expect(formatPercent("1")).toBe("100%")
    expect(formatPercent(0.12345)).toBe("12.35%")
    expect(formatPercent(0.12345, { maxDecimals: 3 })).toBe("12.345%")
    expect(formatPercent(null)).toBe("—")
    expect(formatPercent("abc")).toBe("abc")
  })
})

describe("formatBytes", () => {
  it("uses English binary units", () => {
    expect(formatBytes(512)).toBe("512 B")
    expect(formatBytes(2048)).toBe("2 KB")
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1.5 MB")
    expect(formatBytes(3 * 1024 ** 3)).toBe("3.0 GB")
    expect(formatBytes(-1)).toBe("—")
    expect(withSpanishDefaultLocale(() => formatBytes(1536 * 1024))).toBe("1.5 MB")
  })
})
