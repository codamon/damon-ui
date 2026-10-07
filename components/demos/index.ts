import type { ComponentType } from "react"

import GstDemo from "./gst"
import ConfirmDialogDemo from "./confirm-dialog"
import LabeledFieldDemo from "./labeled-field"
import NoticeDemo from "./notice"
import PageHeaderDemo from "./page-header"
import ResourceStateDemo from "./resource-state"
import StatusBadgeDemo from "./status-badge"
import NzDateDemo from "./nz-date"
import NzMoneyDemo from "./nz-money"
import ThemeShowcase from "./theme-showcase"

/** One demo per registry item, keyed by item name. */
export const demos: Record<string, ComponentType> = {
  "theme-marketing": ThemeShowcase,
  "theme-admin": ThemeShowcase,
  "nz-money": NzMoneyDemo,
  "nz-date": NzDateDemo,
  gst: GstDemo,
  "labeled-field": LabeledFieldDemo,
  "status-badge": StatusBadgeDemo,
  notice: NoticeDemo,
  "page-header": PageHeaderDemo,
  "resource-state": ResourceStateDemo,
  "confirm-dialog": ConfirmDialogDemo,
}

/** Preset the demo frame opens with (default: shadcn neutral). */
export const demoPresets: Record<string, "default" | "marketing" | "admin"> = {
  "theme-marketing": "marketing",
  "theme-admin": "admin",
}
