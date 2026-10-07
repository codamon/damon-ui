"use client"

import * as React from "react"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

const WIDTHS = {
  /** Amounts, dates, percentages, postcodes. */
  sm: "max-w-44",
  /** Names, emails, reference numbers. */
  md: "max-w-md",
  /** Descriptions and free text. */
  full: "",
} as const

type ControlProps = {
  id?: string
  "aria-describedby"?: string
  "aria-invalid"?: React.AriaAttributes["aria-invalid"]
  "aria-required"?: React.AriaAttributes["aria-required"]
}

function joinIds(...ids: Array<string | undefined | false>) {
  const joined = ids.filter(Boolean).join(" ")
  return joined || undefined
}

export interface LabeledFieldProps extends Omit<React.ComponentProps<typeof Field>, "children"> {
  label: React.ReactNode
  /** Help text under the control. Linked with `aria-describedby`. */
  description?: React.ReactNode
  /** Error message. Sets `aria-invalid` on the control; the description stays visible. */
  error?: React.ReactNode
  /** Adds a visual `*` and `aria-required` on the control. Still set `required` yourself if you want browser validation. */
  required?: boolean
  /** Maximum width of the control, sized to the expected content. Default `"full"`. */
  width?: keyof typeof WIDTHS
  /** Id for the control. Defaults to the child's `id`, then a generated one. */
  controlId?: string
  /** Exactly one control element: `<Input>`, `<Textarea>`, `<select>`, `<SelectTrigger>`… */
  children: React.ReactElement<ControlProps>
}

/**
 * Label + control + description + error in one line of JSX, with the
 * accessibility wiring done for you: the control gets an `id`, the label's
 * `htmlFor`, `aria-describedby` (description and error), `aria-invalid` and
 * `aria-required`. Built on shadcn's Field primitives.
 */
function LabeledField({
  label,
  description,
  error,
  required = false,
  width = "full",
  controlId,
  className,
  children,
  ...props
}: LabeledFieldProps) {
  const generatedId = React.useId()
  const child = React.Children.only(children)
  const id = child.props.id ?? controlId ?? `${generatedId}-control`
  const descriptionId = description ? `${generatedId}-description` : undefined
  const errorId = error ? `${generatedId}-error` : undefined
  const invalid = Boolean(error)

  const control = React.cloneElement(child, {
    id,
    "aria-describedby": joinIds(child.props["aria-describedby"], descriptionId, errorId),
    "aria-invalid": child.props["aria-invalid"] ?? (invalid || undefined),
    "aria-required": child.props["aria-required"] ?? (required || undefined),
  })

  return (
    <Field data-slot="labeled-field" data-invalid={invalid || undefined} className={className} {...props}>
      <FieldLabel htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
      </FieldLabel>
      {width === "full" ? control : <div className={cn("w-full", WIDTHS[width])}>{control}</div>}
      {description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </Field>
  )
}

/** Side-by-side fields that stack on small screens (two selects side by side are hard to tap on a phone). */
function FieldRow({
  columns = 2,
  className,
  ...props
}: React.ComponentProps<"div"> & { columns?: 2 | 3 }) {
  return (
    <div
      data-slot="field-row"
      className={cn("grid grid-cols-1 gap-4", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2", className)}
      {...props}
    />
  )
}

/** Footer for a form: primary action first, then secondary actions, consistent spacing everywhere. */
function FormActions({
  align = "start",
  className,
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "end" | "between" }) {
  return (
    <div
      data-slot="form-actions"
      className={cn(
        "flex flex-wrap items-center gap-3",
        align === "end" && "justify-end",
        align === "between" && "justify-between",
        className
      )}
      {...props}
    />
  )
}

export { FieldRow, FormActions, LabeledField }
