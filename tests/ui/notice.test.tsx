// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { Notice } from "@/registry/damon/ui/notice"

afterEach(cleanup)

describe("Notice", () => {
  it.each([
    ["danger", "alert"],
    ["warning", "alert"],
    ["info", "status"],
    ["success", "status"],
  ] as const)("%s uses role=%s", (tone, role) => {
    render(<Notice tone={tone}>Message</Notice>)
    expect(screen.getByRole(role).textContent).toContain("Message")
  })

  it("allows the role to be overridden and renders title and actions", () => {
    render(
      <Notice tone="warning" role="status" title="Heads up" actions={<button>Retry</button>}>
        Body
      </Notice>
    )
    const notice = screen.getByRole("status")
    expect(notice.textContent).toContain("Heads up")
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy()
  })
})
