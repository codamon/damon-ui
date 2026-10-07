// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { FilterBar, FilterChips, FilterField, FilterSearch, FilterSelect } from "@/registry/damon/ui/filter-bar"

afterEach(cleanup)

describe("FilterBar", () => {
  it("is a GET search form that preserves non-empty params", () => {
    render(
      <FilterBar preserve={{ sort: "date", dir: "", page: null }} clearHref="/list">
        <FilterSearch aria-label="Search" />
      </FilterBar>
    )
    const form = screen.getByRole("search") as HTMLFormElement
    expect(form.method).toBe("get")
    const hidden = [...form.querySelectorAll<HTMLInputElement>("input[type=hidden]")].map((i) => [i.name, i.value])
    expect(hidden).toEqual([["sort", "date"]])
    expect(screen.getByRole("link", { name: "Clear" }).getAttribute("href")).toBe("/list")
    expect((screen.getByLabelText("Search") as HTMLInputElement).name).toBe("q")
  })

  it("auto-submits on select change but not while typing", () => {
    const requestSubmit = vi.fn()
    render(
      <FilterBar autoSubmit>
        <FilterSearch aria-label="Search" />
        <FilterField label="Status">
          <FilterSelect name="status" defaultValue="">
            <option value="">Any</option>
            <option value="paid">Paid</option>
          </FilterSelect>
        </FilterField>
      </FilterBar>
    )
    const form = screen.getByRole("search") as HTMLFormElement
    form.requestSubmit = requestSubmit
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "kauri" } })
    expect(requestSubmit).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "paid" } })
    expect(requestSubmit).toHaveBeenCalledTimes(1)
  })

  it("chips link to the URL without that filter", () => {
    render(
      <FilterChips
        clearHref="/list"
        filters={[
          { label: "Status: Paid", removeHref: "/list?q=a" },
          { label: "Search: a", removeHref: "/list?status=paid" },
        ]}
      />
    )
    expect(screen.getByRole("link", { name: /Status: Paid/ }).getAttribute("href")).toBe("/list?q=a")
    expect(screen.getByRole("link", { name: "Clear all" })).toBeTruthy()
  })
})
