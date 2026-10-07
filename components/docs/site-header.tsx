import Link from "next/link"

import { ModeToggle } from "@/components/docs/mode-toggle"

export function SiteHeader() {
  return (
    <header data-site-header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 md:px-6">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
          damon-ui
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/docs/nz-money" className="hover:text-foreground">
            Docs
          </Link>
          <a href="/llms.txt" className="hover:text-foreground">
            llms.txt
          </a>
          <a href="/r/registry.json" className="hover:text-foreground">
            registry.json
          </a>
        </nav>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
