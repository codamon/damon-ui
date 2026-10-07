import { Button } from "@/components/ui/button"
import { PageHeader } from "@/registry/damon/ui/page-header"
import { StatusBadge } from "@/registry/damon/ui/status-badge"

export default function PageHeaderDemo() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Invoices"
        description="12 unpaid · $8,420.00 outstanding"
        actions={
          <>
            <Button variant="outline">Export</Button>
            <Button>New invoice</Button>
          </>
        }
      />
      <PageHeader
        eyebrow={<a href="#">← Invoices</a>}
        title="Invoice INV-0026"
        badge={<StatusBadge status="overdue" variant="pill" />}
        description="Issued 7 Oct 2026 to Kauri Joinery Ltd · due 27 Oct"
        actions={<Button>Record payment</Button>}
      />
    </div>
  )
}
