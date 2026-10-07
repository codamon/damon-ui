"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <Button variant="ghost" size="icon-xs" onClick={copy} aria-label="Copy to clipboard">
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}
