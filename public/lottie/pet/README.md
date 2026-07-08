# Pet Lottie animations

`PetAvatar` fetches `/lottie/pet/<skin>-<stage>-<state>.json` and renders it; any
missing slot falls back to the built-in animated-emoji pet, so the feature works
even with slots removed.

- **skin**: `classic` · `tuxedo` · `ginger` · `calico` · `gray` (see `src/lib/pets.ts`)
- **stage**: `1` (young puppy) or `2` (grown)
- **state**: `idle`, `sleep`, `sick`, `happy` (the `away` state shows an empty
  basket, no Lottie)

That's 5 × 2 × 4 = **40 slots**, all present. Each is a simple, cute vector dog:

| State | Look & motion |
| --- | --- |
| `idle`  | Alert, open eyes, gentle body bob, slow tail wag, occasional blink |
| `sleep` | Eyes closed, slow belly-breathing (the component adds a 💤 badge) |
| `sick`  | Muted fur, worried brows, half-closed eyes, queasy sway + sweat drop (💤→🤒 badge) |
| `happy` | Bouncy hop with squash-&-stretch, fast wag, tongue out, floating hearts |

Puppies (stage 1) are chibi — bigger head, bigger eyes, smaller body — while
grown dogs (stage 2) are more proportioned. Skins differ by palette plus a few
features: the poodle (`calico`) has a topknot and pom ears/tail, the husky
(`gray`) has a darker cap, and the tuxedo has a white chest patch.

## Regenerating

The JSON is **generated**, not hand-edited. Tweak the palettes, geometry, or
motion in `scripts/gen-pet-lottie.mjs` and re-run:

```
node scripts/gen-pet-lottie.mjs
```

This overwrites all 40 `<skin>-<stage>-<state>.json` files in this folder.

`flirting-dog.json` is a stand-alone bonus animation, not wired to any slot.
