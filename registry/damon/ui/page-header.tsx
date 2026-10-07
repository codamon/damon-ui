import * as React from "react"

import { cn } from "@/lib/utils"

export interface PageHeaderProps extends Omit<React.ComponentProps<"header">, "title"> {
  title: React.ReactNode
  /** One line under the title: what this page is for, or a count ("12 waiting"). */
  description?: React.ReactNode
  /** Primary page actions, right-aligned on wide screens, wrapping below the title on narrow ones. */
  actions?: React.ReactNode
  /** Small line above the title: breadcrumb, back link or section name. */
  eyebrow?: React.ReactNode
  /** Inline next to the title, e.g. a `<StatusBadge>`. */
  badge?: React.ReactNode
  /** Heading element. Default `h1`; use `h2` for a section header inside a page. */
  as?: "h1" | "h2" | "h3"
}

/** Title row for an app page: eyebrow, title (+ badge), description, actions. */
function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  badge,
  as: Heading = "h1",
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-wrap items-start justify-between gap-x-6 gap-y-3", className)}
      {...props}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? <div className="text-sm text-muted-foreground">{eyebrow}</div> : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Heading
            className={cn(
              "font-heading font-semibold tracking-tight text-balance",
              Heading === "h1" ? "text-2xl" : "text-lg"
            )}
          >
            {title}
          </Heading>
          {badge}
        </div>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export { PageHeader }
