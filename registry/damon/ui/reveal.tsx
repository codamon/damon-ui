"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type RevealElement = "div" | "li" | "section" | "article" | "span"

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render. Inside `ul`/`ol` use `li`: a wrapper `div` breaks the list for screen readers. */
  as?: RevealElement
  /** Stagger delay in ms. */
  delay?: number
  /** Fraction of the element that must be visible. Default `0.12`. */
  threshold?: number
  /** IntersectionObserver root margin. Default shrinks the viewport bottom by 8%, so items reveal just after they enter. */
  rootMargin?: string
}

/**
 * Fade-and-rise when the element first scrolls into view; fires once.
 *
 * Never hides content by accident: the hidden start state only applies when
 * scripting is enabled (`@media (scripting: enabled)`) and the user hasn't
 * asked for reduced motion. No-JS visitors and crawlers see everything, with
 * no `<noscript>` override needed in the layout.
 */
function Reveal({
  as: Tag = "div",
  delay = 0,
  threshold = 0.12,
  rootMargin = "0px 0px -8% 0px", // raw-colour-ok: IntersectionObserver argument, not styling
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLElement>(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return React.createElement(
    Tag,
    {
      ref,
      "data-slot": "reveal",
      "data-state": shown ? "shown" : "hidden",
      className: cn(
        "motion-safe:transition-[opacity,translate] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]",
        "motion-safe:[@media(scripting:enabled)]:data-[state=hidden]:translate-y-8 motion-safe:[@media(scripting:enabled)]:data-[state=hidden]:opacity-0",
        className
      ),
      style: delay ? { transitionDelay: `${delay}ms`, ...style } : style,
      ...props,
    },
    children
  )
}

export { Reveal }
