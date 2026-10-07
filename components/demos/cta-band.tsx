import { PhoneIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CtaBand } from "@/registry/damon/blocks/cta-band"

export default function CtaBandDemo() {
  return (
    <div className="-m-6 space-y-px overflow-hidden md:-m-10">
      <CtaBand
        title="Talk to a joiner, not a call centre"
        description="Tell us about the room. We'll come and measure, free, anywhere in Auckland."
        primaryAction={
          <Button size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
            Book a measure
          </Button>
        }
        secondaryAction={
          <Button
            size="lg"
            variant="outline"
            className="border-current bg-transparent text-inherit hover:bg-surface-inverse-foreground/10 dark:bg-transparent"
          >
            <PhoneIcon /> 09 123 4567
          </Button>
        }
        note="We reply within one working day. No obligation."
        className="py-14 sm:py-16"
      />
      <CtaBand
        tone="brand"
        align="center"
        title="Ready when you are"
        primaryAction={
          <Button size="lg" variant="secondary">
            Get a quote
          </Button>
        }
        className="py-14 sm:py-16"
      />
      <CtaBand
        tone="muted"
        title="Not sure what you need?"
        description="Send us a photo and we'll suggest options."
        primaryAction={<Button>Send a photo</Button>}
        className="py-12 sm:py-12"
      />
    </div>
  )
}
