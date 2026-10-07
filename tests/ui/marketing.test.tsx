// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CtaBand } from "@/registry/damon/blocks/cta-band"
import { PageHero } from "@/registry/damon/blocks/page-hero"
import { Reveal } from "@/registry/damon/ui/reveal"

afterEach(cleanup)

describe("Reveal", () => {
  let callback: IntersectionObserverCallback
  const disconnect = vi.fn()

  beforeEach(() => {
    disconnect.mockReset()
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb
        }
        observe() {}
        disconnect = disconnect
      }
    )
  })

  it("starts hidden, shows once on intersection, then disconnects", () => {
    render(
      <ul>
        <Reveal as="li" delay={120}>
          Item
        </Reveal>
      </ul>
    )
    const item = screen.getByRole("listitem")
    expect(item.dataset.state).toBe("hidden")
    expect(item.style.transitionDelay).toBe("120ms")
    act(() => callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver))
    expect(item.dataset.state).toBe("shown")
    expect(disconnect).toHaveBeenCalled()
  })

  it("only hides behind scripting-enabled, motion-safe variants", () => {
    render(<Reveal>Text</Reveal>)
    const hiddenClasses = screen.getByText("Text").className.split(" ").filter((c) => c.includes("opacity-0"))
    expect(hiddenClasses).toEqual(["motion-safe:[@media(scripting:enabled)]:data-[state=hidden]:opacity-0"])
  })

  it("shows immediately without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined)
    render(<Reveal>Old browser</Reveal>)
    expect(screen.getByText("Old browser").dataset.state).toBe("shown")
  })
})

describe("marketing blocks", () => {
  it("PageHero labels its section with the h1", () => {
    render(<PageHero eyebrow="Joinery" title="Built to last" intro="Kitchens and stairs." actions={<a href="/contact">Get a quote</a>} />)
    const section = screen.getByRole("region", { name: "Built to last" })
    expect(section.querySelector("h1")?.textContent).toBe("Built to last")
    expect(screen.getByRole("link", { name: "Get a quote" })).toBeTruthy()
  })

  it("CtaBand labels its section with the h2 and renders actions and note", () => {
    render(
      <CtaBand
        title="Ready when you are"
        description="Free measure and quote."
        primaryAction={<a href="/contact">Book a measure</a>}
        secondaryAction={<a href="tel:+6491234567">09 123 4567</a>}
        note="We reply within one working day."
        tone="brand"
      />
    )
    const section = screen.getByRole("region", { name: "Ready when you are" })
    expect(section.dataset.tone).toBe("brand")
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Ready when you are")
    expect(screen.getByText("We reply within one working day.")).toBeTruthy()
  })
})
