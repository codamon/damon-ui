// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/registry/damon/ui/confirm-dialog"

afterEach(cleanup)

describe("ConfirmDialog", () => {
  it("submits the enclosing form on confirm", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <ConfirmDialog trigger={<Button>Delete</Button>} title="Delete it?" confirmLabel="Delete it" />
      </form>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    expect(screen.getByRole("alertdialog")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Delete it" }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("alertdialog")).toBeNull()
  })

  it("does not submit when cancelled", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <ConfirmDialog trigger={<Button>Delete</Button>} title="Delete it?" confirmLabel="Delete it" />
      </form>
    )
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("stays open with the error message when onConfirm rejects, and blocks cancel while pending", async () => {
    let reject!: (e: Error) => void
    const onConfirm = vi.fn(() => new Promise((_, r) => (reject = r)))
    render(<ConfirmDialog trigger={<Button>Cancel order</Button>} title="Cancel?" confirmLabel="Cancel and refund" onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole("button", { name: "Cancel order" }))
    fireEvent.click(screen.getByRole("button", { name: "Cancel and refund" }))
    expect(screen.getByRole("button", { name: "Cancel" }).hasAttribute("disabled")).toBe(true)
    await act(async () => reject(new Error("Refund failed. Nothing was changed.")))
    expect(screen.getByRole("alertdialog")).toBeTruthy()
    expect(screen.getByText("Refund failed. Nothing was changed.")).toBeTruthy()
  })

  it("closes after onConfirm resolves", async () => {
    const onConfirm = vi.fn(async () => {})
    render(<ConfirmDialog trigger={<Button>Archive</Button>} title="Archive?" confirmLabel="Archive it" tone="default" onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole("button", { name: "Archive" }))
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Archive it" }))
    })
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("alertdialog")).toBeNull()
  })
})
