"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, Columns3Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type SortDirection = "asc" | "desc"
export interface SortState {
  id: string
  direction: SortDirection
}
export type SortValue = string | number | bigint | boolean | Date | null | undefined

export interface DataTableColumn<T> {
  /** Stable key; used for sort state, visibility and `data-column`. */
  id: string
  header: React.ReactNode
  /** Cell content. */
  cell: (row: T) => React.ReactNode
  /** Value to sort by on the client. Providing it makes the column sortable. */
  sortValue?: (row: T) => SortValue
  /** Sortable without `sortValue`, for server-side sorting with `sortHref`. */
  sortable?: boolean
  /** Right-align with tabular figures (amounts, counts, dates in a column). */
  numeric?: boolean
  /** Can the user hide it from the Columns menu? Default `true`. */
  hideable?: boolean
  /** Hidden until the user turns it on. Default `false`. */
  defaultHidden?: boolean
  /** Plain-text name for the Columns menu when `header` isn't a string. */
  label?: string
  className?: string
  headerClassName?: string
}

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" })

/** Compare two sort values: empty values last, numbers numerically, text with natural order ("INV-2" < "INV-10"). */
export function compareSortValues(a: SortValue, b: SortValue): number {
  const emptyA = a === null || a === undefined || a === ""
  const emptyB = b === null || b === undefined || b === ""
  if (emptyA || emptyB) return emptyA === emptyB ? 0 : emptyA ? 1 : -1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === "bigint" && typeof b === "bigint") return a < b ? -1 : a > b ? 1 : 0
  if (typeof a === "number" && typeof b === "number") return a - b
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b)
  return collator.compare(String(a), String(b))
}

/**
 * Stable sort by a column's `sortValue`. Empty values stay last in both
 * directions, so "no due date" never floats to the top of a descending sort.
 */
export function sortRows<T>(rows: readonly T[], column: Pick<DataTableColumn<T>, "sortValue"> | undefined, direction: SortDirection): T[] {
  if (!column?.sortValue) return [...rows]
  const value = column.sortValue
  const sign = direction === "asc" ? 1 : -1
  return rows
    .map((row, index) => ({ row, index, key: value(row) }))
    .sort((x, y) => {
      const emptyX = x.key === null || x.key === undefined || x.key === ""
      const emptyY = y.key === null || y.key === undefined || y.key === ""
      if (emptyX !== emptyY) return emptyX ? 1 : -1
      return compareSortValues(x.key, y.key) * sign || x.index - y.index
    })
    .map((entry) => entry.row)
}

/** Next sort when a header is clicked: asc → desc → asc on the same column, asc on a new one. */
export function nextSort(current: SortState | null | undefined, id: string): SortState {
  return current?.id === id && current.direction === "asc" ? { id, direction: "desc" } : { id, direction: "asc" }
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: readonly T[]
  getRowId: (row: T) => string
  /** Describes the table for screen readers (rendered visually hidden). */
  caption: string

  /** Uncontrolled initial sort. */
  defaultSort?: SortState | null
  /** Controlled sort. Pair with `onSortChange`. */
  sort?: SortState | null
  onSortChange?: (sort: SortState) => void
  /**
   * Server-side sorting via links: return the URL for a sort. Rows are then
   * rendered in the order given (the server sorts) and headers become links.
   */
  sortHref?: (sort: SortState) => string

  /** Show row checkboxes. */
  selectable?: boolean
  /** Controlled selection (row ids). */
  selected?: ReadonlySet<string>
  onSelectedChange?: (selected: Set<string>) => void
  /** Rendered in a bar above the table while rows are selected. */
  bulkActions?: (selectedIds: string[], clear: () => void) => React.ReactNode

  /** Show the Columns menu. Default: true when any column is hideable and there are 4+ columns. */
  columnToggle?: boolean
  /** Left side of the toolbar row, e.g. a `<FilterSearch>` or counts. */
  toolbar?: React.ReactNode
  /** Below the table, e.g. a `<Pager>`. */
  footer?: React.ReactNode

  /** Shown in place of rows when `rows` is empty, e.g. an `<EmptyState>`. */
  empty?: React.ReactNode
  /** Show skeleton rows instead of data. */
  loading?: boolean
  density?: "compact" | "comfortable"
  rowClassName?: (row: T) => string | undefined
  /** Accessible name for a row checkbox, e.g. `(row) => "Select " + row.number`. */
  rowLabel?: (row: T) => string
  className?: string
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (direction === "asc") return <ArrowUpIcon aria-hidden="true" className="size-3.5" />
  if (direction === "desc") return <ArrowDownIcon aria-hidden="true" className="size-3.5" />
  return <ChevronsUpDownIcon aria-hidden="true" className="size-3.5 opacity-40" />
}

/**
 * Table for admin lists: sortable columns, row selection with a bulk-action
 * bar, a column visibility menu, empty and loading states. Column defs are
 * plain objects; no table library. Built on shadcn's Table.
 *
 * For big data sets sort and paginate on the server (`sortHref` + `<Pager>`).
 */
function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  defaultSort = null,
  sort: sortProp,
  onSortChange,
  sortHref,
  selectable = false,
  selected: selectedProp,
  onSelectedChange,
  bulkActions,
  columnToggle,
  toolbar,
  footer,
  empty,
  loading = false,
  density = "comfortable",
  rowClassName,
  rowLabel,
  className,
}: DataTableProps<T>) {
  const [sortState, setSortState] = React.useState<SortState | null>(defaultSort)
  const sort = sortProp !== undefined ? sortProp : sortState
  const [hidden, setHidden] = React.useState<Set<string>>(
    () => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.id))
  )
  const [selectedState, setSelectedState] = React.useState<Set<string>>(() => new Set())
  const selected = selectedProp ?? selectedState

  const visibleColumns = columns.filter((c) => !hidden.has(c.id))
  const hideableColumns = columns.filter((c) => c.hideable !== false)
  const showColumnToggle = columnToggle ?? (hideableColumns.length > 0 && columns.length >= 4)

  const sortColumn = sort ? columns.find((c) => c.id === sort.id) : undefined
  const displayRows = React.useMemo(
    () => (sort && !sortHref ? sortRows(rows, sortColumn, sort.direction) : rows),
    [rows, sort, sortColumn, sortHref]
  )

  const rowIds = displayRows.map(getRowId)
  // Only ids still on screen count, so filtering never leaves invisible rows selected.
  const selectedVisible = rowIds.filter((id) => selected.has(id))
  const allSelected = rowIds.length > 0 && selectedVisible.length === rowIds.length
  const someSelected = selectedVisible.length > 0 && !allSelected

  function setSelected(next: Set<string>) {
    if (!selectedProp) setSelectedState(next)
    onSelectedChange?.(next)
  }
  const clearSelection = () => setSelected(new Set())

  function changeSort(id: string) {
    const next = nextSort(sort, id)
    if (sortProp === undefined) setSortState(next)
    onSortChange?.(next)
  }

  const cellPadding = density === "compact" ? "py-1.5" : "py-2.5"
  const colSpan = visibleColumns.length + (selectable ? 1 : 0)

  return (
    <div data-slot="data-table" className={cn("space-y-3", className)}>
      {toolbar || showColumnToggle ? (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{toolbar}</div>
          {showColumnToggle ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3Icon aria-hidden="true" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuLabel>Show columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hideableColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={!hidden.has(column.id)}
                    // Keep at least one column visible.
                    disabled={!hidden.has(column.id) && visibleColumns.length === 1}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) =>
                      setHidden((current) => {
                        const next = new Set(current)
                        if (checked) next.delete(column.id)
                        else next.add(column.id)
                        return next
                      })
                    }
                  >
                    {column.label ?? (typeof column.header === "string" ? column.header : column.id)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      ) : null}

      {selectable && selectedVisible.length > 0 ? (
        <div
          aria-live="polite"
          className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/50 px-3 py-2 text-sm"
        >
          <span className="font-medium tabular-nums">{selectedVisible.length} selected</span>
          {bulkActions?.(selectedVisible, clearSelection)}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={clearSelection}>
            Clear selection
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <Table aria-busy={loading || undefined}>
          <TableCaption className="sr-only">{caption}</TableCaption>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              {selectable ? (
                <TableHead className="w-10 pl-3">
                  <Checkbox
                    aria-label="Select all rows"
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    disabled={loading || rowIds.length === 0}
                    onCheckedChange={() => setSelected(allSelected ? new Set() : new Set([...selected, ...rowIds]))}
                  />
                </TableHead>
              ) : null}
              {visibleColumns.map((column) => {
                const active = sort?.id === column.id ? sort.direction : null
                const sortable = column.sortable ?? Boolean(column.sortValue)
                const headerContent = (
                  <>
                    {column.header}
                    <SortIcon direction={active} />
                  </>
                )
                const buttonClass = cn(
                  "-mx-2 inline-flex h-7 items-center gap-1 rounded-md px-2 font-medium hover:bg-accent hover:text-accent-foreground",
                  column.numeric && "flex-row-reverse"
                )
                return (
                  <TableHead
                    key={column.id}
                    data-column={column.id}
                    aria-sort={active === "asc" ? "ascending" : active === "desc" ? "descending" : sortable ? "none" : undefined}
                    className={cn("text-xs text-muted-foreground", column.numeric && "text-right", column.headerClassName)}
                  >
                    {!sortable ? (
                      column.header
                    ) : sortHref ? (
                      <Link href={sortHref(nextSort(sort, column.id))} className={buttonClass}>
                        {headerContent}
                      </Link>
                    ) : (
                      <button type="button" onClick={() => changeSort(column.id)} className={buttonClass}>
                        {headerContent}
                      </button>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                  {selectable ? (
                    <TableCell className="pl-3">
                      <Skeleton className="size-4" />
                    </TableCell>
                  ) : null}
                  {visibleColumns.map((column, c) => (
                    <TableCell key={column.id} className={cellPadding}>
                      <Skeleton
                        className={cn("h-3.5", column.numeric ? "ml-auto w-14" : c === 0 ? "w-3/4" : "w-1/2")}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="p-0 whitespace-normal">
                  {empty ?? <p className="py-10 text-center text-sm text-muted-foreground">No results.</p>}
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row, index) => {
                const id = rowIds[index]
                const isSelected = selected.has(id)
                return (
                  <TableRow
                    key={id}
                    data-state={isSelected ? "selected" : undefined}
                    className={rowClassName?.(row)}
                  >
                    {selectable ? (
                      <TableCell className="pl-3">
                        <Checkbox
                          aria-label={rowLabel?.(row) ?? `Select row ${index + 1}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            const next = new Set(selected)
                            if (checked) next.add(id)
                            else next.delete(id)
                            setSelected(next)
                          }}
                        />
                      </TableCell>
                    ) : null}
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        data-column={column.id}
                        className={cn(cellPadding, column.numeric && "text-right tabular-nums", column.className)}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {footer}
    </div>
  )
}

export { DataTable }
