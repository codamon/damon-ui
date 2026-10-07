export interface SampleInvoice {
  id: string
  number: string
  customer: string
  status: "paid" | "unpaid" | "overdue" | "draft" | "sent"
  issuedOn: string
  dueOn: string | null
  total: string
}

const customers = [
  "Kauri Joinery Ltd",
  "Harbour Physio",
  "Tui Street Cafe",
  "Ridgeline Builders",
  "Aroha Florist",
  "Southern Signs",
  "Matai Accounting",
  "Pounamu Plumbing",
]
const statuses: SampleInvoice["status"][] = ["paid", "unpaid", "overdue", "paid", "draft", "sent", "paid", "unpaid"]

/** Deterministic demo data (no Math.random, so static HTML and client match). */
export const sampleInvoices: SampleInvoice[] = Array.from({ length: 42 }, (_, i) => {
  const day = (i % 28) + 1
  const month = 9 + (i % 2)
  const status = statuses[i % statuses.length]
  return {
    id: `inv_${i + 1}`,
    number: `INV-${String(i + 1).padStart(4, "0")}`,
    customer: customers[(i * 3) % customers.length],
    status,
    issuedOn: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    dueOn: status === "draft" ? null : `2026-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    total: (((i * 7919) % 450000) / 100 + 35).toFixed(2),
  }
})
