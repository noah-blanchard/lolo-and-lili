# UI Animation Gotchas — `motion/react` `AnimatePresence`

This repo uses `motion/react` (the successor to Framer Motion v11+) for UI animations. Most components are straightforward, but **modal / lightbox / overlay exit animations** have a footgun that is easy to miss.

## The Exit-Animation Trap

`AnimatePresence` only works when it is **mounted while its children unmount**. If the component that contains `AnimatePresence` returns early (`return null`) before the wrapper can render, the browser removes the DOM nodes instantly — no exit animation runs.

### Broken pattern

```tsx
export function Lightbox({ item, isOpen, onClose }: Props) {
  // ❌ This kills the exit animation.
  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div exit={{ opacity: 0 }}>
          {/* content */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

When the parent closes the lightbox it usually clears both state values in the same render:

```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);
const selectedItem = items.find((i) => i.id === selectedId);

<Lightbox item={selectedItem} isOpen={!!selectedId} onClose={() => setSelectedId(null)} />
```

As soon as `selectedId` becomes `null`, `selectedItem` is also `null`, the early return fires, and `AnimatePresence` is never rendered — so the exit variant never plays. The overlay just vanishes.

## The Fix

1. Keep `AnimatePresence` and the `motion.div` shell mounted while exiting.
2. Guard only the **inner rendered content**.
3. Hold onto a stable reference of the item while the exit animation plays.

### Correct pattern

```tsx
export function Lightbox({ item, isOpen, onClose }: Props) {
  const itemRef = useRef(item);
  if (item) itemRef.current = item;
  const renderedItem = item ?? itemRef.current;

  if (!renderedItem) return null; // still safe for the initial mount

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div exit={{ opacity: 0 }}>
          {/* use renderedItem here */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Even better: avoid the `if (!renderedItem) return null;` guard entirely when the component is always controlled by an `isOpen` prop:

```tsx
export function Lightbox({ item, isOpen, onClose }: Props) {
  const itemRef = useRef(item);
  if (item) itemRef.current = item;
  const renderedItem = item ?? itemRef.current;

  return (
    <AnimatePresence>
      {isOpen && renderedItem && (
        <motion.div exit={{ opacity: 0 }}>
          {/* use renderedItem here */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

This way `AnimatePresence` is always mounted, detects the child unmounting, and runs the `exit` variant even though `item` is already `null`.

## Where We Hit This

Fixed in `src/components/features/notes/note-lightbox.tsx` during the love-notes redesign. The black "lights out" overlay was disappearing abruptly because the parent zeroed out the selected note in the same render that set `isOpen={false}`.

The corrected version uses a `renderedNote` ref and keeps `AnimatePresence` rendered for the full exit duration.

## General Rules

- If a component uses `AnimatePresence`, do **not** place an early `return null` before it.
- The component that owns the mount/unmount state should render `AnimatePresence` unconditionally.
- For modals / lightboxes / drawers, keep a transient reference to the data being exited so the UI doesn't flash or collapse during the close animation.
- Prefer a slow, deliberate exit duration for overlays that dim the screen (e.g. 0.6s–1.2s). A fast fade feels broken because the human eye notices the abrupt change in ambient brightness.
