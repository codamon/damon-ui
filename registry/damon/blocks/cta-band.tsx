import * as React from "react"

import { cn } from "@/lib/utils"

export interface CtaBandProps extends Omit<React.ComponentProps<"section">, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  /** Main action, usually `<Button asChild size="lg"><Link href="/contact">…</Link></Button>`. */
  primaryAction?: React.ReactNode
  /** Second action, e.g. a phone link. */
  secondaryAction?: React.ReactNode
  /** Small print under the actions: response time, no-obligation note. */
  note?: React.ReactNode
  /**
   * `inverse` (default): dark band on a light page. `brand`: brand gradient.
   * `muted`: quiet `surface-2` band for mid-page prompts.
   */
  tone?: "inverse" | "brand" | "muted"
  /** Background layer, e.g. `<Image fill className="object-cover" …/>`. A scrim keeps text readable. */
  background?: React.ReactNode
  align?: "start" | "center"
  headingId?: string
}

/**
 * Closing call-to-action section: big heading, one or two actions, small
 * print. Uses `surface-inverse`, `brand-gradient` and `text-display` tokens.
 */
function CtaBand({
  title,
  description,
  primaryAction,
  secondaryAction,
  note,
  tone = "inverse",
  background,
  align = "start",
  headingId,
  className,
  ...props
}: CtaBandProps) {
  const generatedId = React.useId()
  const id = headingId ?? `${generatedId}-title`
  const onDark = tone !== "muted"
  const centered = align === "center"

  return (
    <section
      data-slot="cta-band"
      data-tone={tone}
      aria-labelledby={id}
      className={cn(
        "relative isolate overflow-hidden py-16 sm:py-24",
        tone === "inverse" && "bg-surface-inverse text-surface-inverse-foreground",
        tone === "brand" && "bg-(image:--brand-gradient) text-brand-foreground",
        tone === "muted" && "bg-surface-2 text-foreground",
        className
      )}
      {...props}
    >
      {background ? (
        <>
          <div className="absolute inset-0 -z-20">{background}</div>
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-r from-surface-inverse/95 via-surface-inverse/80 to-surface-inverse/60"
          />
        </>
      ) : null}
      <div className={cn("mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", centered && "text-center")}>
        <h2
          id={id}
          className={cn(
            "max-w-3xl font-heading text-display font-semibold tracking-tight text-balance",
            centered && "mx-auto"
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-6 max-w-xl text-lg leading-relaxed text-pretty",
              onDark ? "opacity-80" : "text-muted-foreground",
              centered && "mx-auto"
            )}
          >
            {description}
          </p>
        ) : null}
        {primaryAction || secondaryAction ? (
          <div className={cn("mt-10 flex flex-col gap-3 sm:flex-row sm:items-center", centered && "sm:justify-center")}>
            {primaryAction}
            {secondaryAction}
          </div>
        ) : null}
        {note ? (
          <p className={cn("mt-8 max-w-2xl text-sm", onDark ? "opacity-70" : "text-muted-foreground", centered && "mx-auto")}>
            {note}
          </p>
        ) : null}
      </div>
    </section>
  )
}

export { CtaBand }
