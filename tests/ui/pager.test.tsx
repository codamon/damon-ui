// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { buildQuery, CursorPager, pageBounds, Pager, pageRange } from "@/registry/damon/ui/pager"

afterEach(cleanup)

describe("pageRange", () => {
  it("lists every page when they fit", () => {
    expect(pageRange(1, 1)).toEqual([1])
    expect(pageRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("adds ellipses around the current page", () => {
    expect(pageRange(6, 20)).toEqual([1, "ellipsis-start", 5, 6, 7, "ellipsis-end", 20])
    expect(pageRange(1, 20)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20])
    expect(pageRange(20, 20)).toEqual([1, "ellipsis-start", 16, 17, 18, 19, 20])
    expect(pageRange(10, 20, 2)).toEqual([1, "ellipsis-start", 8, 9, 10, 11, 12, "ellipsis-end", 20])
  })

  it("keeps a constant length and always shows first, last and current", () => {
    for (const total of [8, 9, 20, 137]) {
      for (let page = 1; page <= total; page++) {
        const items = pageRange(page, total)
        expect(items, `${page}/${total}`).toHaveLength(7)
        expect(items[0]).toBe(1)
        expect(items.at(-1)).toBe(total)
        expect(items).toContain(page)
        const numbers = items.filter((i): i is number => typeof i === "number")
        expect(numbers).toEqual([...numbers].sort((a, b) => a - b))
        // an ellipsis always hides at least one page
        items.forEach((item, i) => {
          if (typeof item === "string") expect((items[i + 1] as number) - (items[i - 1] as number)).toBeGreaterThan(1)
        })
      }
    }
  })

  it("clamps bad input", () => {
    expect(pageRange(0, 3)).toEqual([1, 2, 3])
    expect(pageRange(9, 3)).toEqual([1, 2, 3])
    expect(pageRange(1, 0)).toEqual([1])
  })
})

describe("buildQuery and pageBounds", () => {
  it("drops empty values", () => {
    expect(buildQuery({ status: "paid", q: "", page: 2, from: null, to: undefined })).toBe("?status=paid&page=2")
    expect(buildQuery({})).toBe("")
    expect(buildQuery({ q: "a&b c" })).toBe("?q=a%26b+c")
  })
  it("computes the visible range", () => {
    expect(pageBounds(2, 20, 312)).toEqual({ from: 21, to: 40 })
    expect(pageBounds(16, 20, 312)).toEqual({ from: 301, to: 312 })
    expect(pageBounds(1, 20, 0)).toEqual({ from: 0, to: 0 })
  })
})

describe("Pager", () => {
  it("calls onPageChange and disables the ends", () => {
    const onPageChange = vi.fn()
    render(<Pager page={1} pageCount={5} totalItems={93} pageSize={20} onPageChange={onPageChange} />)
    expect(screen.getByText("1–20 of 93 results")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Previous page" }).hasAttribute("disabled")).toBe(true)
    expect(screen.getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBe("page")
    fireEvent.click(screen.getByRole("button", { name: "Next page" }))
    fireEvent.click(screen.getByRole("button", { name: "Page 4" }))
    expect(onPageChange.mock.calls).toEqual([[2], [4]])
  })

  it("renders links in URL mode", () => {
    render(<Pager page={2} pageCount={3} hrefFor={(p) => `/list?page=${p}`} />)
    expect(screen.getByRole("link", { name: "Next page" }).getAttribute("href")).toBe("/list?page=3")
    expect(screen.getByRole("link", { name: "Page 2" }).getAttribute("aria-current")).toBe("page")
    expect(screen.getByText("Page 2 of 3")).toBeTruthy()
  })

  it("CursorPager renders nothing on a single page", () => {
    const { container } = render(<CursorPager nextHref={null} firstHref={null} />)
    expect(container.innerHTML).toBe("")
  })
})
