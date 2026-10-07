import { Button } from "@/components/ui/button"
import { EmptyState, ErrorState, LoadingState } from "@/registry/damon/ui/resource-state"

export default function ResourceStateDemo() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border">
        <EmptyState
          title="No invoices yet"
          description="Invoices you create or import will show up here."
          action={<Button>New invoice</Button>}
        />
      </div>
      <div className="rounded-lg border">
        <ErrorState
          description="We couldn't reach the server. Your saved invoices are not affected."
          action={<Button variant="outline">Try again</Button>}
          reference="req_7f3a91"
        />
      </div>
      <div className="lg:col-span-2">
        <LoadingState variant="table" rows={4} label="Loading invoices" />
      </div>
    </div>
  )
}
