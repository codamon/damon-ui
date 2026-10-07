import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import {
  formatGstNumber,
  gstFromExclusive,
  gstFromInclusive,
  hasGst,
  inclusiveFromExclusive,
  isGstConsistent,
  isValidGstNumber,
  netFromInclusive,
  normalizeGstNumber,
  NZ_GST_RATE,
  splitInclusive,
} from "@/registry/damon/lib/gst"

const SRC = readFileSync("registry/damon/lib/gst.ts", "utf8")

describe("GST-inclusive amounts", () => {
  // Vectors shared with the GST domain tests of a production tax app
  it.each([
    ["115.00", "100.00", "15.00"],
    ["100.00", "86.96", "13.04"],
    ["1.15", "1.00", "0.15"],
    ["0.01", "0.01", "0.00"],
    ["3.45", "3.00", "0.45"],
    ["1234.56", "1073.53", "161.03"],
    ["0.30", "0.26", "0.04"],
    ["49.99", "43.47", "6.52"],
  ])("%s → net %s, gst %s", (gross, net, gst) => {
    expect(netFromInclusive(gross)).toBe(net)
    expect(gstFromInclusive(gross)).toBe(gst)
    expect(splitInclusive(gross)).toEqual({ gross: Number(gross).toFixed(2), net, gst })
  })

  it("takes the rate as an argument", () => {
    expect(gstFromInclusive("110.00", "0.10")).toBe("10.00")
    expect(netFromInclusive("110.00", "0.1")).toBe("100.00")
    expect(splitInclusive("100", "0")).toEqual({ gross: "100.00", net: "100.00", gst: "0.00" })
    expect(gstFromInclusive("112.50", "0.125")).toBe("12.50")
  })

  it("handles refunds and credit notes", () => {
    expect(netFromInclusive("-115.00")).toBe("-100.00")
    expect(gstFromInclusive("-115.00")).toBe("-15.00")
    expect(splitInclusive("-0.30")).toEqual({ gross: "-0.30", net: "-0.26", gst: "-0.04" })
  })

  it("keeps precision on large amounts", () => {
    expect(netFromInclusive("99999999999.99")).toBe("86956521739.12")
    expect(gstFromInclusive("99999999999999.99")).toBe("13043478260869.56")
  })

  it("rounds sub-cent input to cents before computing", () => {
    expect(splitInclusive("115.005")).toEqual({ gross: "115.01", net: "100.01", gst: "15.00" })
    expect(gstFromInclusive("115.994")).toBe("15.13")
  })

  it("accepts numbers", () => {
    expect(gstFromInclusive(115)).toBe("15.00")
    expect(splitInclusive(0.1 + 0.2)).toEqual({ gross: "0.30", net: "0.26", gst: "0.04" })
  })

  it("net + gst always equals gross, and matches independent rounding at 15% (0.01–200.00)", () => {
    const mismatches: string[] = []
    for (let cents = 1; cents <= 20_000; cents++) {
      const gross = (cents / 100).toFixed(2)
      const { net, gst } = splitInclusive(gross)
      const netCents = Math.round(Number(net) * 100)
      const gstCents = Math.round(Number(gst) * 100)
      if (netCents + gstCents !== cents) mismatches.push(`${gross}: sum`)
      // independent rounding of gross/1.15 = gross*20/23, half up, in integers
      const independentNet = Math.floor((cents * 20 * 2 + 23) / (23 * 2))
      if (independentNet !== netCents) mismatches.push(`${gross}: net ${net} vs ${independentNet}`)
    }
    expect(mismatches).toEqual([])
  })

  it("throws on junk instead of treating it as zero", () => {
    for (const bad of ["abc", "", "NaN", "Infinity", "1,000", "$5", "."]) {
      expect(() => gstFromInclusive(bad), bad).toThrow(RangeError)
    }
    expect(() => gstFromInclusive(Number.NaN)).toThrow(RangeError)
    expect(() => gstFromInclusive("100", "-0.15")).toThrow(/negative/)
  })

  it("never uses floating point maths on amounts", () => {
    for (const forbidden of ["parseFloat", "Math.round", "toFixed(2)", "Number(gross", "* 1.15", "/ 1.15"]) {
      expect(SRC, forbidden).not.toContain(forbidden)
    }
  })
})

describe("GST-exclusive amounts", () => {
  it("adds GST on top", () => {
    expect(gstFromExclusive("100")).toBe("15.00")
    expect(inclusiveFromExclusive("100")).toBe("115.00")
    expect(inclusiveFromExclusive("86.96")).toBe("100.00")
    expect(gstFromExclusive("0.03")).toBe("0.00") // 0.0045 → 0.00
    expect(gstFromExclusive("0.04")).toBe("0.01") // 0.006 → 0.01
    expect(gstFromExclusive("-10")).toBe("-1.50")
    expect(NZ_GST_RATE).toBe("0.15")
  })
})

describe("isGstConsistent", () => {
  it("allows a 2c tolerance by default", () => {
    expect(isGstConsistent({ subtotal: "100", gst: "15.00" })).toBe(true)
    expect(isGstConsistent({ subtotal: "100", gst: "15.02" })).toBe(true)
    expect(isGstConsistent({ subtotal: "100", gst: "14.98" })).toBe(true)
    expect(isGstConsistent({ subtotal: "100", gst: "15.03" })).toBe(false)
    expect(isGstConsistent({ subtotal: "100", gst: "15.03", tolerance: "0.05" })).toBe(true)
    expect(isGstConsistent({ subtotal: "100", gst: "10", rate: "0.10" })).toBe(true)
    expect(isGstConsistent({ subtotal: "-200", gst: "-30" })).toBe(true)
  })
})

describe("hasGst", () => {
  it("treats every spelling of zero and missing as no GST", () => {
    for (const zero of ["0", "0.0000", "0.00", "-0.0000", " 0 ", ".0", 0]) expect(hasGst(zero), String(zero)).toBe(false)
    expect(hasGst(null)).toBe(false)
    expect(hasGst(undefined)).toBe(false)
    expect(hasGst("47.4500")).toBe(true)
    expect(hasGst("0.0100")).toBe(true)
    expect(hasGst(3.2)).toBe(true)
  })
})

describe("GST / IRD numbers", () => {
  // IRD payroll specification 2026–27 §6.1 worked examples, as used in production invoice checks.
  it.each(["49091850", "35901981", "49098576", "136410132", "160000007", "49-091-850", "GST 136 410 132"])(
    "%s is valid",
    (value) => expect(isValidGstNumber(value)).toBe(true)
  )

  it.each(["136410133", "9125568", "49091851", "200000010", "150000026", "", "4909185a", "1234567890", null])(
    "%s is invalid",
    (value) => expect(isValidGstNumber(value)).toBe(false)
  )

  it("rejects a base whose check digit is 10 under both weightings", () => {
    let found = false
    for (let n = 1_000_000; n < 1_020_000 && !found; n++) {
      const base = String(n).padStart(8, "0")
      found = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].every((d) => !isValidGstNumber(`${base}${d}`))
    }
    expect(found).toBe(true)
  })

  it.each([
    ["49-091-850", "49091850"],
    ["136-410-132", "136410132"],
    ["GST 49 091 850", "49091850"],
    ["136.410.132", "136410132"],
    ["GST No: 49/091/850", null],
    ["  ", null],
    [null, null],
    ["1234567890", null],
    ["12#34", null],
  ])("normalises %s → %s", (input, expected) => {
    expect(normalizeGstNumber(input)).toBe(expected)
  })

  it("formats for display", () => {
    expect(formatGstNumber("49091850")).toBe("49-091-850")
    expect(formatGstNumber("136410132")).toBe("136-410-132")
    expect(formatGstNumber("GST 136 410 132")).toBe("136-410-132")
    expect(formatGstNumber("123")).toBe("123")
  })
})
