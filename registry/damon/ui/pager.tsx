import * as React from "react"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Query string from params, skipping empty values. Use it to build page,
 * sort and "clear filters" links that keep the other filters.
 *
 * @example buildQuery({ status: "paid", q: "", page: 2 }) // "?status=paid&page=2"
 */
export function buildQuery(params: Record<string, string | number | null | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") query.set(key, String(value))
  }
  const text = query.toString()
  return text ? `?${text}` : ""
}

export type PageItem = number | "ellipsis-start" | "ellipsis-end"

/**
 * Page numbers to show: first, last, the current page and `siblings` on each
 * side, with ellipses for gaps. The list length is stable while paging, so
 * buttons don't jump around under the pointer.
 *
 * @example pageRange(6, 20) // [1, "ellipsis-start", 5, 6, 7, "ellipsis-end", 20]
 */
export function pageRange(current: number, pageCount: number, siblings = 1): PageItem[] {
  const total = Math.max(1, Math.floor(pageCount))
  const page = Math.min(Math.max(1, Math.floor(current)), total)
  // first + last + current + siblings*2 + two ellipsis slots
  const slots = siblings * 2 + 5
  if (total <= slots) return Array.from({ length: total }, (_, i) => i + 1)

  const left = Math.max(page - siblings, 2)
  const right = Math.min(page + siblings, total - 1)
  const showStart = left > 3
  const showEnd = right < total - 2

  if (!showStart) {
    const end = slots - 2
    return [...Array.from({ length: end }, (_, i) => i + 1), "ellipsis-end", total]
  }
  if (!showEnd) {
    const start = total - (slots - 3)
    return [1, "ellipsis-start", ...Array.from({ length: total - start + 1 }, (_, i) => start + i)]
  }
  return [1, "ellipsis-start", ...Array.from({ length: right - left + 1 }, (_, i) => left + i), "ellipsis-end", total]
}

/** `{ from: 21, to: 40 }` for page 2 of 20-per-page; `{ from: 0, to: 0 }` when there are no items. */
export function pageBounds(page: number, pageSize: number, totalItems: number) {
  if (totalItems <= 0) return { from: 0, to: 0 }
  const from = (page - 1) * pageSize + 1
  return { from: Math.min(from, totalItems), to: Math.min(page * pageSize, totalItems) }
}

type PageControl =
  | { hrefFor: (page: number) => string; onPageChange?: never }
  | { onPageChange: (page: number) => void; hrefFor?: never }

export type PagerProps = Omit<React.ComponentProps<"nav">, "children"> &
  PageControl & {
    /** 1-based current page. */
    page: number
    pageCount: number
    /** With `pageSize`, shows "21–40 of 312". */
    totalItems?: number
    pageSize?: number
    /** Page links on each side of the current page. Default 1. */
    siblings?: number
    /** Noun for the summary, plural. Default `"results"`. */
    itemLabel?: string
  }

function PageButton({
  page,
  control,
  disabled,
  current,
  label,
  children,
  className,
}: {
  page: number
  control: PageControl
  disabled?: boolean
  current?: boolean
  label: string
  children: React.ReactNode
  className?: string
}) {
  const variant = current ? "outline" : "ghost"
  // size="sm" + explicit square: older shadcn buttons have no icon-sm size.
  className = cn("size-8 p-0", className)
  if (disabled) {
    return (
      <Button variant={variant} size="sm" disabled aria-label={label} className={className}>
        {children}
      </Button>
    )
  }
  if (control.hrefFor) {
    return (
      <Button variant={variant} size="sm" asChild className={className}>
        <Link href={control.hrefFor(page)} aria-label={label} aria-current={current ? "page" : undefined}>
          {children}
        </Link>
      </Button>
    )
  }
  return (
    <Button
      variant={variant}
      size="sm"
      aria-label={label}
      aria-current={current ? "page" : undefined}
      onClick={() => control.onPageChange?.(page)}
      className={className}
    >
      {children}
    </Button>
  )
}

/**
 * Numbered pagination. URL-driven with `hrefFor` (works without JS, shareable
 * links) or state-driven with `onPageChange`.
 */
function Pager({
  page,
  pageCount,
  totalItems,
  pageSize,
  siblings = 1,
  itemLabel = "results",
  hrefFor,
  onPageChange,
  className,
  ...props
}: PagerProps) {
  const control = (hrefFor ? { hrefFor } : { onPageChange }) as PageControl
  const total = Math.max(1, pageCount)
  const current = Math.min(Math.max(1, page), total)
  const bounds = totalItems !== undefined && pageSize ? pageBounds(current, pageSize, totalItems) : null

  return (
    <nav
      data-slot="pager"
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3 text-sm", className)}
      {...props}
    >
      <p className="text-muted-foreground tabular-nums">
        {bounds && totalItems !== undefined
          ? `${bounds.from}–${bounds.to} of ${totalItems.toLocaleString("en-NZ")} ${itemLabel}`
          : `Page ${current} of ${total}`}
      </p>
      <div className="flex items-center gap-1">
        <PageButton page={current - 1} control={control} disabled={current <= 1} label="Previous page">
          <ChevronLeftIcon />
        </PageButton>
        {pageRange(current, total, siblings).map((item) =>
          typeof item === "number" ? (
            <PageButton
              key={item}
              page={item}
              control={control}
              current={item === current}
              label={`Page ${item}`}
              className="w-auto min-w-8 px-2 tabular-nums"
            >
              {item}
            </PageButton>
          ) : (
            <span key={item} aria-hidden="true" className="w-8 text-center text-muted-foreground">
              …
            </span>
          )
        )}
        <PageButton page={current + 1} control={control} disabled={current >= total} label="Next page">
          <ChevronRightIcon />
        </PageButton>
      </div>
    </nav>
  )
}

export interface CursorPagerProps extends Omit<React.ComponentProps<"nav">, "children"> {
  /** Link to the next page, or `null` on the last page. */
  nextHref: string | null
  /** Link back to the first page, or `null` when already on it. */
  firstHref: string | null
  nextLabel?: string
  firstLabel?: string
}

/**
 * Next / back-to-first links for keyset (cursor) pagination, where there's
 * no page count. Renders nothing when there is only one page.
 */
function CursorPager({
  nextHref,
  firstHref,
  nextLabel = "Next page",
  firstLabel = "First page",
  className,
  ...props
}: CursorPagerProps) {
  if (!nextHref && !firstHref) return null
  return (
    <nav
      data-slot="cursor-pager"
      aria-label="Pagination"
      className={cn("flex items-center justify-between gap-3", className)}
      {...props}
    >
      <span>
        {firstHref ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={firstHref}>
              <ChevronsLeftIcon />
              {firstLabel}
            </Link>
          </Button>
        ) : null}
      </span>
      <span>
        {nextHref ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={nextHref}>
              {nextLabel}
              <ChevronRightIcon />
            </Link>
          </Button>
        ) : null}
      </span>
    </nav>
  )
}

export { CursorPager, Pager }
