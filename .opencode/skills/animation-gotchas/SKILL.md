---
name: animation-gotchas
description: motion/react AnimatePresence gotchas, exit animation patterns, and the cute/bouncy animation feel
---

## What This Skill Covers

Critical patterns for `motion/react` animations — especially exit animations
in modals, lightboxes, drawers, and overlays.

## The AnimatePresence Trap (CRITICAL)

`AnimatePresence` only works when it is **mounted while its children unmount**.
If the component containing `AnimatePresence` returns early (`return null`) before
the wrapper renders, exit animations silently fail.

### Broken Pattern (DO NOT DO THIS)

```tsx
export function Lightbox({ item, isOpen, onClose }) {
  if (!item) return null;  // Kills exit animation
  return (
    <AnimatePresence>
      {isOpen && <motion.div exit={{ opacity: 0 }}>...</motion.div>}
    </AnimatePresence>
  );
}
```

When `selectedId` clears, `item` becomes null, the early return fires,
`AnimatePresence` is never rendered, exit variant never plays.

### Correct Pattern

```tsx
export function Lightbox({ item, isOpen, onClose }) {
  const itemRef = useRef(item);
  if (item) itemRef.current = item;
  const renderedItem = item ?? itemRef.current;
  if (!renderedItem) return null; // safe for initial mount only

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div exit={{ opacity: 0 }}>
          {/* use renderedItem */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Even better — avoid the guard entirely when controlled by `isOpen`:

```tsx
export function Lightbox({ item, isOpen, onClose }) {
  const itemRef = useRef(item);
  if (item) itemRef.current = item;
  const renderedItem = item ?? itemRef.current;

  return (
    <AnimatePresence>
      {isOpen && renderedItem && (
        <motion.div exit={{ opacity: 0 }}>
          {/* use renderedItem */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## Rules

1. Never place an early `return null` before `<AnimatePresence>`.
2. Keep `AnimatePresence` mounted unconditionally; guard only inner content.
3. Hold a transient ref to data being exited so UI doesn't flash during close.
4. Use slow, deliberate exit durations for overlays (0.6s-1.2s). Fast fade feels broken.

## Animation Helpers (from `@/lib/motion`)

| Helper | Use For |
|--------|---------|
| `springBouncy` | Interactive elements — taps, toggles, nav indicator. `{ type: "spring", stiffness: 500, damping: 18, mass: 0.6 }` |
| `springSoft` | Layout transitions, exit animations. `{ type: "spring", stiffness: 260, damping: 26 }` |
| `tapScale` | Press feedback — `{ scale: 0.94 }` |
| `hoverScale` | Hover feedback — `{ scale: 1.03 }` |
| `popIn` | Card/list item entrance — opacity 0->1, scale 0.9->1, y 8->0 |
| `staggerContainer` | Staggered list — `staggerChildren: 0.05` |

## The Feel

This is a "cute/bouncy" PWA for couples. Animations should feel joyful and
playful — not corporate or flat. Use `springBouncy` liberally on interactive
elements. Never use plain CSS transitions on buttons, cards, or nav items.
