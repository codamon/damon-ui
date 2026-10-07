// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { compareSortValues, DataTable, nextSort, sortRows, type DataTableColumn } from "@/registry/damon/ui/data-table"

afterEach(cleanup)

interface Row {
  id: string
  name: string
  amount: number | null
}

const rows: Row[] = [
  { id: "a", name: "INV-10", amount: 50 },
  { id: "b", name: "INV-2", amount: null },
  { id: "c", name: "inv-1", amount: 200 },
]

const columns: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", cell: (r) => r.name, sortValue: (r) => r.name },
  { id: "amount", header: "Amount", numeric: true, cell: (r) => String(r.amount ?? "—"), sortValue: (r) => r.amount },
]

describe("sorting helpers", () => {
  it("sorts text naturally and case-insensitively", () => {
    expect(sortRows(rows, columns[0], "asc").map((r) => r.name)).toEqual(["inv-1", "INV-2", "INV-10"])
    expect(sortRows(rows, columns[0], "desc").map((r) => r.name)).toEqual(["INV-10", "INV-2", "inv-1"])
  })

  it("keeps empty values last in both directions", () => {
    expect(sortRows(rows, columns[1], "asc").map((r) => r.id)).toEqual(["a", "c", "b"])
    expect(sortRows(rows, columns[1], "desc").map((r) => r.id)).toEqual(["c", "a", "b"])
  })

  it("is stable and does not mutate", () => {
    const tied = [
      { id: "1", name: "x", amount: 1 },
      { id: "2", name: "x", amount: 1 },
    ]
    expect(sortRows(tied, columns[1], "desc").map((r) => r.id)).toEqual(["1", "2"])
    const copy = [...rows]
    sortRows(rows, columns[0], "asc")
    expect(rows).toEqual(copy)
  })

  it("compares dates, bigints and booleans", () => {
    expect(compareSortValues(new Date(1), new Date(2))).toBeLessThan(0)
    expect(compareSortValues(BigInt(5), BigInt(3))).toBeGreaterThan(0)
    expect(compareSortValues(false, true)).toBeLessThan(0)
    expect(compareSortValues("", "a")).toBeGreaterThan(0)
  })

  it("cycles asc → desc → asc", () => {
    expect(nextSort(null, "name")).toEqual({ id: "name", direction: "asc" })
    expect(nextSort({ id: "name", direction: "asc" }, "name")).toEqual({ id: "name", direction: "desc" })
    expect(nextSort({ id: "name", direction: "desc" }, "name")).toEqual({ id: "name", direction: "asc" })
    expect(nextSort({ id: "name", direction: "desc" }, "amount")).toEqual({ id: "amount", direction: "asc" })
  })
})

function bodyNames() {
  const body = screen.getAllByRole("rowgroup")[1]
  return within(body)
    .getAllByRole("row")
    .map((row) => within(row).getAllByRole("cell").at(-2)!.textContent)
}

describe("DataTable", () => {
  it("sorts when a header is clicked and sets aria-sort", () => {
    render(<DataTable caption="Rows" columns={columns} rows={rows} getRowId={(r) => r.id} selectable />)
    const header = screen.getByRole("columnheader", { name: /Name/ })
    expect(header.getAttribute("aria-sort")).toBe("none")
    fireEvent.click(within(header).getByRole("button"))
    expect(header.getAttribute("aria-sort")).toBe("ascending")
    expect(bodyNames()).toEqual(["inv-1", "INV-2", "INV-10"])
    fireEvent.click(within(header).getByRole("button"))
    expect(header.getAttribute("aria-sort")).toBe("descending")
  })

  it("selects all visible rows and shows the bulk bar", () => {
    render(
      <DataTable
        caption="Rows"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        selectable
        rowLabel={(r) => `Select ${r.name}`}
        bulkActions={(ids) => <span>bulk:{ids.join(",")}</span>}
      />
    )
    fireEvent.click(screen.getByRole("checkbox", { name: "Select INV-2" }))
    expect(screen.getByText("1 selected")).toBeTruthy()
    expect(screen.getByRole("checkbox", { name: "Select all rows" }).getAttribute("aria-checked")).toBe("mixed")
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }))
    expect(screen.getByText("3 selected")).toBeTruthy()
    expect(screen.getByText("bulk:a,b,c")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }))
    expect(screen.queryByText(/selected/)).toBeNull()
  })

  it("renders sort links and keeps server order with sortHref", () => {
    render(
      <DataTable
        caption="Rows"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        sort={{ id: "name", direction: "asc" }}
        sortHref={(s) => `?sort=${s.id}&dir=${s.direction}`}
      />
    )
    expect(screen.getByRole("link", { name: /Name/ }).getAttribute("href")).toBe("?sort=name&dir=desc")
    expect(screen.getByRole("link", { name: /Amount/ }).getAttribute("href")).toBe("?sort=amount&dir=asc")
    const body = screen.getAllByRole("rowgroup")[1]
    expect(within(body).getAllByRole("row").map((r) => within(r).getAllByRole("cell")[0].textContent)).toEqual([
      "INV-10",
      "INV-2",
      "inv-1",
    ])
  })

  it("shows the empty slot and loading skeleton", () => {
    const { rerender } = render(
      <DataTable caption="Rows" columns={columns} rows={[]} getRowId={(r) => r.id} empty={<p>Nothing here</p>} />
    )
    expect(screen.getByText("Nothing here")).toBeTruthy()
    rerender(<DataTable caption="Rows" columns={columns} rows={rows} getRowId={(r) => r.id} loading />)
    expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("true")
    expect(screen.queryByText("INV-10")).toBeNull()
  })
})
