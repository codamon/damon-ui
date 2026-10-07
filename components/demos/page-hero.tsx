import { Button } from "@/components/ui/button"
import { PageHero } from "@/registry/damon/blocks/page-hero"

export default function PageHeroDemo() {
  return (
    <div className="-m-6 space-y-px overflow-hidden md:-m-10">
      <PageHero
        eyebrow="Kitchens"
        size="display"
        title="A kitchen made for the way you cook"
        intro="We design, build and install in one team, so the person who measures is the person who fits."
        actions={
          <>
            <Button size="lg">Book a free measure</Button>
            <Button size="lg" variant="outline">
              See our work
            </Button>
          </>
        }
        media={
          <div className="flex aspect-4/3 items-end rounded-2xl bg-(image:--brand-gradient) p-6 text-sm text-brand-foreground">
            Your photo here
          </div>
        }
        className="py-14 sm:py-16"
      />
      <PageHero tone="inverse" align="center" title="Built to last" intro="Kitchens, wardrobes and stairs made in Auckland." className="py-14 sm:py-16" />
    </div>
  )
}
