import registryJson from "@/registry.json"

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://damon-ui.pages.dev").replace(/\/$/, "")

export interface RegistryFile {
  path: string
  type: string
  target?: string
}

export interface RegistryItem {
  name: string
  type: string
  title?: string
  description?: string
  categories?: string[]
  dependencies?: string[]
  registryDependencies?: string[]
  files?: RegistryFile[]
}

export interface Registry {
  name: string
  homepage: string
  items: RegistryItem[]
}

export const GROUPS = [
  { type: "registry:theme", label: "Theme" },
  { type: "registry:lib", label: "Lib" },
  { type: "registry:hook", label: "Hooks" },
  { type: "registry:ui", label: "UI" },
  { type: "registry:block", label: "Blocks" },
] as const

export function loadRegistry(): Registry {
  return registryJson as Registry
}

export function getItem(name: string): RegistryItem | undefined {
  return loadRegistry().items.find((item) => item.name === name)
}

/** Items grouped in sidebar order. */
export function groupedItems() {
  const { items } = loadRegistry()
  return GROUPS.map((group) => ({
    ...group,
    items: items.filter((item) => item.type === group.type),
  })).filter((group) => group.items.length > 0)
}
