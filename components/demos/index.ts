import type { ComponentType } from "react"

import NzMoneyDemo from "./nz-money"

/** One demo per registry item, keyed by item name. */
export const demos: Record<string, ComponentType> = {
  "nz-money": NzMoneyDemo,
}
