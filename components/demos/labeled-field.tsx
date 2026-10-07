"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldRow, FormActions, LabeledField } from "@/registry/damon/ui/labeled-field"

export default function LabeledFieldDemo() {
  const [submitted, setSubmitted] = useState(false)
  return (
    <form
      noValidate
      className="max-w-xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
    >
      <LabeledField label="Business name" description="As it appears on your invoices." required width="md">
        <Input name="name" defaultValue="Kauri Joinery Ltd" />
      </LabeledField>
      <FieldRow>
        <LabeledField label="Amount" width="sm" required error={submitted ? "Enter an amount, e.g. 120.50" : undefined}>
          <Input name="amount" inputMode="decimal" placeholder="0.00" />
        </LabeledField>
        <LabeledField label="Date" width="sm">
          <Input name="date" type="date" defaultValue="2026-10-07" />
        </LabeledField>
      </FieldRow>
      <LabeledField label="Notes" description="Optional. Visible to your accountant.">
        <Textarea name="notes" rows={2} />
      </LabeledField>
      <FormActions>
        <Button type="submit">Save expense</Button>
        <Button type="button" variant="ghost" onClick={() => setSubmitted(false)}>
          Reset
        </Button>
      </FormActions>
    </form>
  )
}
