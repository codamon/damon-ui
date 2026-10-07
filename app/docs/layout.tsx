import { SidebarNav } from "@/components/docs/sidebar-nav"
import { groupedItems } from "@/lib/registry"

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  const groups = groupedItems().map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({ name: item.name, title: item.title ?? item.name })),
  }))

  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-4 md:px-6">
      <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-52 shrink-0 overflow-y-auto py-8 md:block">
        <SidebarNav groups={groups} />
      </aside>
      <main className="min-w-0 flex-1 py-8">{children}</main>
    </div>
  )
}
