// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { humanizeStatus, normalizeStatus, StatusBadge, statusTone } from "@/registry/damon/ui/status-badge"

afterEach(cleanup)

describe("status helpers", () => {
  it("normalises and humanises", () => {
    expect(normalizeStatus(" Pending Review ")).toBe("pending_review")
    expect(normalizeStatus("partially-paid")).toBe("partially_paid")
    expect(humanizeStatus("pending_review")).toBe("Pending review")
    expect(humanizeStatus("sin pagar")).toBe("Sin pagar")
    expect(humanizeStatus("")).toBe("—")
  })

  it("looks up tones with overrides and a neutral fallback", () => {
    expect(statusTone("PAID")).toBe("success")
    expect(statusTone("overdue")).toBe("danger")
    expect(statusTone("Pending Review")).toBe("warning")
    expect(statusTone("mystery")).toBe("neutral")
    expect(statusTone("ready_for_pickup", { ready_for_pickup: "success" })).toBe("success")
    expect(statusTone("paid", { paid: "info" })).toBe("info")
  })
})

describe("StatusBadge", () => {
  it("renders a text label with tone data attributes", () => {
    render(<StatusBadge status="pending_review" />)
    const badge = screen.getByText("Pending review")
    expect(badge.dataset.tone).toBe("warning")
    expect(badge.dataset.status).toBe("pending_review")
  })

  it("prefers an explicit label and tone", () => {
    render(<StatusBadge status="paid" label="Pagado" tone="info" variant="pill" />)
    expect(screen.getByText("Pagado").dataset.tone).toBe("info")
  })
})
