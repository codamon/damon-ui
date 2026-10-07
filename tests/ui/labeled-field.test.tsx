// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { Input } from "@/components/ui/input"
import { LabeledField } from "@/registry/damon/ui/labeled-field"

afterEach(cleanup)

describe("LabeledField", () => {
  it("links label, description and error to the control", () => {
    render(
      <LabeledField label="Email" description="For receipts" error="Enter an email" required>
        <Input name="email" />
      </LabeledField>
    )
    const input = screen.getByLabelText(/Email/)
    expect(input.tagName).toBe("INPUT")
    expect(input.getAttribute("aria-invalid")).toBe("true")
    expect(input.getAttribute("aria-required")).toBe("true")
    const describedBy = input.getAttribute("aria-describedby")!.split(" ")
    expect(describedBy).toHaveLength(2)
    expect(document.getElementById(describedBy[0])!.textContent).toBe("For receipts")
    expect(document.getElementById(describedBy[1])!.textContent).toBe("Enter an email")
    expect(screen.getByRole("alert").textContent).toBe("Enter an email")
  })

  it("keeps the child's own id and aria values", () => {
    render(
      <LabeledField label="Amount" description="NZD">
        <Input id="amount" aria-describedby="external" aria-invalid={false} />
      </LabeledField>
    )
    const input = screen.getByLabelText("Amount")
    expect(input.id).toBe("amount")
    expect(input.getAttribute("aria-describedby")).toMatch(/^external \S+-description$/)
    expect(input.getAttribute("aria-invalid")).toBe("false")
  })

  it("adds nothing when there is no description or error", () => {
    render(
      <LabeledField label="Name">
        <Input />
      </LabeledField>
    )
    const input = screen.getByLabelText("Name")
    expect(input.hasAttribute("aria-describedby")).toBe(false)
    expect(input.hasAttribute("aria-invalid")).toBe(false)
    expect(input.hasAttribute("aria-required")).toBe(false)
  })

  it("generates unique ids per field", () => {
    render(
      <>
        <LabeledField label="A">
          <Input />
        </LabeledField>
        <LabeledField label="B">
          <Input />
        </LabeledField>
      </>
    )
    expect(screen.getByLabelText("A").id).not.toBe(screen.getByLabelText("B").id)
  })
})
