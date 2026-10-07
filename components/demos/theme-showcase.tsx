import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const swatches = [
  ["background", "bg-background"],
  ["card", "bg-card"],
  ["primary", "bg-primary"],
  ["secondary", "bg-secondary"],
  ["muted", "bg-muted"],
  ["accent", "bg-accent"],
  ["brand", "bg-brand"],
  ["surface-1", "bg-surface-1"],
  ["surface-inverse", "bg-surface-inverse"],
  ["destructive", "bg-destructive"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["info", "bg-info"],
] as const

const tones = [
  ["Paid", "bg-success/10 text-success"],
  ["Overdue", "bg-destructive/10 text-destructive"],
  ["Pending", "bg-warning/10 text-warning"],
  ["Draft", "bg-info/10 text-info"],
] as const

export function ThemeShowcase() {
  return (
    <div className="space-y-8">
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
        {swatches.map(([name, cls]) => (
          <li key={name} className="text-xs">
            <div className={`${cls} h-12 rounded-md border`} />
            <div className="mt-1.5 font-mono text-muted-foreground">{name}</div>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-card p-5 text-card-foreground">
          <div className="space-y-2">
            <Label htmlFor="theme-email">Email</Label>
            <Input id="theme-email" placeholder="you@example.co.nz" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>Save</Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="outline">Export</Button>
            <Button variant="ghost">More</Button>
            <Button variant="destructive">Delete</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tones.map(([label, cls]) => (
              <Badge key={label} className={cls}>
                {label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-lg bg-surface-inverse p-5 text-surface-inverse-foreground">
          <p className="font-heading text-display font-semibold tracking-tight">Ship it once.</p>
          <p className="text-sm opacity-80">
            <code className="font-mono">text-display</code> scales
            from 2rem to 3.5rem with the viewport.
          </p>
          <div>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90">Get started</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeShowcase
