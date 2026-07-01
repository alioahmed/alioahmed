import { cn } from '@/lib/utils'

/**
 * GradientMesh — the brand's signature atmospheric backdrop (docs/DESIGN.md).
 * Cream (top-left) → lavender/indigo (top-right) → magenta hint → cool mint (bottom-right),
 * floating on white. Built from layered radial-gradients (`.gradient-mesh`) — GPU-cheap and
 * fully responsive, no image asset — then masked to fade into the canvas below.
 *
 * Purely decorative: aria-hidden + pointer-events-none. Position it with a parent that is
 * `relative isolate` (see Section `mesh`), and give it a height via className.
 */
export function GradientMesh({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('gradient-mesh pointer-events-none select-none', className)}
      style={{
        maskImage: 'linear-gradient(to bottom, #000 52%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 52%, transparent 100%)',
      }}
    />
  )
}
