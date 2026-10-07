"use client"

import * as React from "react"
import Link from "next/link"
import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface FilterBarProps extends Omit<React.ComponentProps<"form">, "method"> {
  /** Link that removes all filters (usually the bare list URL). Hidden when omitted. */
  clearHref?: string
  applyLabel?: string
  clearLabel?: string
  /**
   * Submit as soon as a select, checkbox, radio or date changes. Text inputs
   * still wait for Enter or Apply. The Apply button stays for keyboard users.
   */
  autoSubmit?: boolean
  /** Params to carry through the submit as hidden inputs, e.g. the current sort. Empty values are skipped. */
  preserve?: Record<string, string | number | null | undefined>
}

/**
 * Filters for a list page as a plain GET form: submitting updates the URL
 * query, so filtered views are shareable, survive reloads and work before
 * hydration. Read the values back from `searchParams` on the server.
 */
function FilterBar({
  clearHref,
  applyLabel = "Apply",
  clearLabel = "Clear",
  autoSubmit = false,
  preserve,
  className,
  children,
  onChange,
  ...props
}: FilterBarProps) {
  function handleChange(event: React.ChangeEvent<HTMLFormElement>) {
    onChange?.(event)
    if (!autoSubmit) return
    const target = event.target as unknown as HTMLInputElement | HTMLSelectElement
    const instant =
      target.tagName === "SELECT" || ["checkbox", "radio", "date", "month"].includes((target as HTMLInputElement).type)
    if (instant) event.currentTarget.requestSubmit()
  }

  return (
    <form
      data-slot="filter-bar"
      role="search"
      method="get"
      className={cn("flex flex-wrap items-end gap-3", className)}
      onChange={handleChange}
      {...props}
    >
      {preserve
        ? Object.entries(preserve).map(([name, value]) =>
            value === null || value === undefined || value === "" ? null : (
              <input key={name} type="hidden" name={name} value={String(value)} />
            )
          )
        : null}
      {children}
      <div className="flex items-center gap-2">
        <Button type="submit" variant="secondary">
          {applyLabel}
        </Button>
        {clearHref ? (
          <Button variant="ghost" asChild>
            <Link href={clearHref}>{clearLabel}</Link>
          </Button>
        ) : null}
      </div>
    </form>
  )
}

/** Small labelled slot for one filter control. The `<label>` wraps the control, so no ids are needed. */
function FilterField({
  label,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"label">, "children"> & { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label data-slot="filter-field" className={cn("grid gap-1.5 text-xs", className)} {...props}>
      <span className="font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

/** Search input with an icon, sized for a filter bar. Submits on Enter. */
function FilterSearch({
  className,
  name = "q",
  type = "search",
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <div data-slot="filter-search" className={cn("relative min-w-48 flex-1 sm:max-w-xs", className)}>
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input name={name} type={type} className="pl-8" {...props} />
    </div>
  )
}

/**
 * Native `<select>` styled like shadcn's Input. Native on purpose: it works
 * inside a GET form without JS and gives phones their own picker.
 */
function FilterSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="filter-select"
      className={cn(
        "h-9 min-w-36 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

export interface ActiveFilter {
  /** "Status: Paid" */
  label: React.ReactNode
  /** URL with this one filter removed. */
  removeHref: string
}

/** Applied filters as removable chips, so people can see why the list is short. */
function FilterChips({
  filters,
  clearHref,
  clearLabel = "Clear all",
  className,
  ...props
}: React.ComponentProps<"ul"> & { filters: ActiveFilter[]; clearHref?: string; clearLabel?: string }) {
  if (filters.length === 0) return null
  return (
    <ul
      data-slot="filter-chips"
      aria-label="Active filters"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      {filters.map((filter, index) => (
        <li key={index}>
          <Link
            href={filter.removeHref}
            className="inline-flex h-7 items-center gap-1 rounded-full border bg-muted/50 pr-2 pl-3 text-xs hover:bg-muted"
          >
            {filter.label}
            <XIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
            <span className="sr-only">(remove filter)</span>
          </Link>
        </li>
      ))}
      {clearHref && filters.length > 1 ? (
        <li>
          <Link href={clearHref} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
            {clearLabel}
          </Link>
        </li>
      ) : null}
    </ul>
  )
}

export { FilterBar, FilterChips, FilterField, FilterSearch, FilterSelect }
