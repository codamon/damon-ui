import { Button } from "@/components/ui/button"
import { Notice } from "@/registry/damon/ui/notice"

export default function NoticeDemo() {
  return (
    <div className="max-w-2xl space-y-3">
      <Notice>Invoices are emailed from billing@yourdomain.co.nz once your domain is verified.</Notice>
      <Notice tone="success" title="Return filed">GST for Aug–Sep 2026 was filed with IRD on 28 Oct.</Notice>
      <Notice tone="warning" title="This period is filed">Changes need an amendment, not an edit.</Notice>
      <Notice
        tone="danger"
        title="Couldn't send the invoice"
        actions={
          <Button size="sm" variant="outline">
            Try again
          </Button>
        }
      >
        The mail provider rejected the message. Nothing was sent to the customer.
      </Notice>
    </div>
  )
}
