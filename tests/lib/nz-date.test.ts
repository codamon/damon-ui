import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import {
  addDays,
  daysInMonth,
  differenceInDays,
  formatNzDate,
  formatNzDateTime,
  isCivilDate,
  nzDateOf,
  nzDateTimeParts,
  nzTaxYear,
  nzTaxYearRange,
  todayInNz,
  weekdayOf,
} from "@/registry/damon/lib/nz-date"

const SRC = readFileSync("registry/damon/lib/nz-date.ts", "utf8")

/** Run code as if the process default locale were `tag` (only when no locale is passed). */
function withDefaultDateLocale<T>(tag: string, run: () => T): T {
  const original = Intl.DateTimeFormat
  const patched = function (locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions) {
    return new original(locales ?? tag, options)
  } as unknown as typeof Intl.DateTimeFormat
  patched.supportedLocalesOf = original.supportedLocalesOf
  Intl.DateTimeFormat = patched
  try {
    return run()
  } finally {
    Intl.DateTimeFormat = original
  }
}

describe("calendar date arithmetic", () => {
  it("adds days across months, years and leap days", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01")
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29")
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01")
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28")
    expect(addDays("2026-10-07", 20)).toBe("2026-10-27")
    expect(addDays("2026-10-07", 0)).toBe("2026-10-07")
  })

  it("counts days between dates", () => {
    expect(differenceInDays("2026-10-27", "2026-10-07")).toBe(20)
    expect(differenceInDays("2026-10-07", "2026-10-27")).toBe(-20)
    expect(differenceInDays("2027-03-31", "2026-04-01")).toBe(364)
    expect(differenceInDays("2029-01-01", "2028-01-01")).toBe(366)
  })

  it("knows weekdays", () => {
    expect(weekdayOf("2026-10-07")).toBe(3) // Wednesday
    expect(weekdayOf("1970-01-01")).toBe(4) // Thursday
    expect(weekdayOf("2000-02-29")).toBe(2) // Tuesday
    expect(weekdayOf("1969-12-31")).toBe(3)
  })

  it("validates dates", () => {
    expect(isCivilDate("2026-02-28")).toBe(true)
    expect(isCivilDate("2028-02-29")).toBe(true)
    expect(isCivilDate("2026-02-29")).toBe(false)
    expect(isCivilDate("2026-13-01")).toBe(false)
    expect(isCivilDate("2026-03-31T00:00:00Z")).toBe(false)
    expect(isCivilDate(20261007)).toBe(false)
    expect(daysInMonth(2026, 2)).toBe(28)
    expect(daysInMonth(2000, 2)).toBe(29)
    expect(daysInMonth(1900, 2)).toBe(28)
  })

  it("rejects timestamps instead of silently truncating them", () => {
    expect(() => addDays("2026-03-31T00:00:00Z", 1)).toThrow(RangeError)
    expect(() => differenceInDays("2026-02-30", "2026-02-01")).toThrow(RangeError)
  })

  it("never builds a Date from a calendar date", () => {
    for (const name of ["addDays", "differenceInDays", "weekdayOf", "formatNzDate", "nzTaxYear"]) {
      const body = new RegExp(`export function ${name}\\([\\s\\S]*?\\n\\}`).exec(SRC)?.[0] ?? ""
      expect(body, name).not.toBe("")
      expect(body, name).not.toMatch(/new Date|Date\.parse|Date\.UTC/)
    }
  })
})

describe("instants in NZ time", () => {
  it("maps UTC evening to the next NZ day", () => {
    expect(nzDateOf("2026-09-05T11:30:00Z")).toBe("2026-09-05") // NZST +12 → 23:30
    expect(nzDateOf("2026-09-05T13:30:00Z")).toBe("2026-09-06")
    expect(nzDateOf("2026-01-10T11:30:00Z")).toBe("2026-01-11") // NZDT +13
  })

  it("handles daylight saving transitions", () => {
    // DST starts 2026-09-27 02:00 NZST → 03:00 NZDT (13:59Z / 14:00Z on the 26th)
    expect(nzDateTimeParts("2026-09-26T13:59:00Z")).toEqual({ date: "2026-09-27", hour: 1, minute: 59 })
    expect(nzDateTimeParts("2026-09-26T14:00:00Z")).toEqual({ date: "2026-09-27", hour: 3, minute: 0 })
  })

  it("today is computed from an injectable now", () => {
    expect(todayInNz(Date.parse("2026-10-06T23:00:00Z"))).toBe("2026-10-07")
    expect(todayInNz(new Date("2026-10-07T10:59:00Z"))).toBe("2026-10-07")
    expect(todayInNz(new Date("2026-10-07T11:00:00Z"))).toBe("2026-10-08")
  })

  it("formats timestamps as d MMM yyyy, HH:mm", () => {
    expect(formatNzDateTime("2026-09-17T02:05:00Z")).toBe("17 Sep 2026, 14:05")
    expect(formatNzDateTime("2026-02-10T01:05:00Z")).toBe("10 Feb 2026, 14:05")
    expect(formatNzDateTime("2026-09-16T12:00:00Z")).toBe("17 Sep 2026, 00:00") // midnight is 00, not 24
    expect(formatNzDateTime(null)).toBe("—")
    expect(formatNzDateTime("", { empty: "never" })).toBe("never")
  })

  it("is identical under any process default locale", () => {
    for (const tag of ["en-US", "es", "ja", "zh-CN", "ar-EG", "mi"]) {
      expect(withDefaultDateLocale(tag, () => formatNzDateTime("2026-09-17T02:05:00Z")), tag).toBe(
        "17 Sep 2026, 14:05"
      )
    }
    // fixture self-check
    expect(withDefaultDateLocale("ja", () => new Intl.DateTimeFormat().format(new Date(0)))).not.toBe(
      new Intl.DateTimeFormat("en-NZ").format(new Date(0))
    )
  })
})

describe("formatNzDate", () => {
  it("formats calendar dates", () => {
    expect(formatNzDate("2026-08-15")).toBe("15 Aug 2026")
    expect(formatNzDate("2026-01-01")).toBe("1 Jan 2026")
    expect(formatNzDate("2026-10-07", { weekday: true })).toBe("Wed 7 Oct 2026")
    expect(formatNzDate("2026-10-07", { weekday: true, year: false })).toBe("Wed 7 Oct")
    expect(formatNzDate(null)).toBe("—")
    expect(formatNzDate("soon")).toBe("soon")
  })

  it("does not shift tax year boundary days", () => {
    expect(formatNzDate("2026-03-31")).toBe("31 Mar 2026")
    expect(formatNzDate("2026-04-01")).toBe("1 Apr 2026")
  })
})

describe("NZ tax year", () => {
  it("names the year by its 31 March end", () => {
    expect(nzTaxYear("2026-03-31")).toBe(2026)
    expect(nzTaxYear("2026-04-01")).toBe(2027)
    expect(nzTaxYear("2026-10-07")).toBe(2027)
    expect(nzTaxYearRange(2027)).toEqual({ start: "2026-04-01", end: "2027-03-31" })
  })
})
