import type { ComponentType } from "react"

import NzMoneyDemo from "./nz-money"
import ThemeShowcase from "./theme-showcase"

/** One demo per registry item, keyed by item name. */
export const demos: Record<string, ComponentType> = {
  "theme-marketing": ThemeShowcase,
  "theme-admin": ThemeShowcase,
  "nz-money": NzMoneyDemo,
}

/** Preset the demo frame opens with (default: shadcn neutral). */
export const demoPresets: Record<string, "default" | "marketing" | "admin"> = {
  "theme-marketing": "marketing",
  "theme-admin": "admin",
}
