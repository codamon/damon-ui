import * as React from "react"

import { cn } from "@/lib/utils"

export interface PageHeroProps extends Omit<React.ComponentProps<"section">, "title"> {
  title: React.ReactNode
  /** Paragraph under the title. Keep it to two or three lines. */
  intro?: React.ReactNode
  /** Small uppercase label above the title. */
  eyebrow?: React.ReactNode
  /** Calls to action, e.g. two `<Button asChild>` links. */
  actions?: React.ReactNode
  /** Image, illustration or form shown beside the copy on wide screens (below on mobile). */
  media?: React.ReactNode
  /**
   * `hero` (`text-hero`) is for two or three words. A full-sentence title needs
   * `display` (`text-display`), or it wraps to four lines and pushes everything below the fold.
   */
  size?: "hero" | "display"
  align?: "start" | "center"
  /** Section background. Default `surface-1`. */
  tone?: "surface" | "background" | "inverse"
  /** Id for the heading; the section is labelled by it. */
  headingId?: string
}

/**
 * Opening section for a marketing page: eyebrow, big title, intro, actions,
 * optional media. Copy rises in on load (skipped for reduced motion).
 * Uses `text-hero` / `text-display` and `surface-*` tokens from @damon/theme-marketing.
 */
function PageHero({
  title,
  intro,
  eyebrow,
  actions,
  media,
  size = "hero",
  align = "start",
  tone = "surface",
  headingId,
  className,
  ...props
}: PageHeroProps) {
  const generatedId = React.useId()
  const id = headingId ?? `${generatedId}-title`
  const centered = align === "center" && !media
  const rise = "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-700 motion-safe:fill-mode-both"

  return (
    <section
      data-slot="page-hero"
      aria-labelledby={id}
      className={cn(
        "relative isolate overflow-hidden py-20 sm:py-28",
        tone === "surface" && "bg-surface-1 text-foreground",
        tone === "background" && "bg-background text-foreground",
        tone === "inverse" && "bg-surface-inverse text-surface-inverse-foreground",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:px-8",
          media && "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center"
        )}
      >
        <div className={cn("max-w-3xl", centered && "mx-auto text-center")}>
          {eyebrow ? (
            <p
              className={cn(
                rise,
                "mb-4 text-sm font-semibold tracking-widest uppercase",
                tone === "inverse" ? "opacity-80" : "text-primary"
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            id={id}
            className={cn(
              rise,
              "font-heading font-semibold tracking-tight text-balance",
              size === "hero" ? "text-hero" : "text-display"
            )}
          >
            {title}
          </h1>
          {intro ? (
            <p
              className={cn(
                rise,
                "mt-6 max-w-2xl text-lg leading-relaxed text-pretty delay-150 sm:text-xl",
                centered && "mx-auto",
                tone === "inverse" ? "opacity-80" : "text-muted-foreground"
              )}
            >
              {intro}
            </p>
          ) : null}
          {actions ? (
            <div className={cn(rise, "mt-10 flex flex-wrap gap-3 delay-300", centered && "justify-center")}>
              {actions}
            </div>
          ) : null}
        </div>
        {media ? <div className={cn(rise, "delay-200")}>{media}</div> : null}
      </div>
    </section>
  )
}

export { PageHero }
