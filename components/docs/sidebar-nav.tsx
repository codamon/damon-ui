"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface NavGroup {
  label: string
  items: { name: string; title: string }[]
}

export function SidebarNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-6 text-sm">
      {groups.map((group) => (
        <div key={group.label}>
          <h4 className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {group.label}
          </h4>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const href = `/docs/${item.name}`
              const active = pathname === href
              return (
                <li key={item.name}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    // Close the mobile "Browse items" disclosure after navigating.
                    onClick={(e) => e.currentTarget.closest("details")?.removeAttribute("open")}
                    className={cn(
                      "block rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground",
                      active && "bg-muted font-medium text-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
