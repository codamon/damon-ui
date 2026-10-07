import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { SiteHeader } from "@/components/docs/site-header"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: { default: "damon-ui", template: "%s · damon-ui" },
  description:
    "Damon's shadcn registry: proven Next.js + Tailwind v4 components, NZ formatting helpers and SEO plumbing, documented for AI agents.",
}

// Applied before paint so dark mode does not flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-svh">
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
