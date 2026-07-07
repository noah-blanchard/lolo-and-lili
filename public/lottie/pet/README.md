# Pet Lottie animations

`PetAvatar` fetches `/lottie/pet/<stage>-<state>.json` and renders it; any
missing slot falls back to the built-in animated-emoji pet, so the feature works
even with slots removed.

- **stage**: `1` (young) or `2` (grown).
- **state**: `idle`, `sleep`, `sick`, `happy` (the `away` state shows an empty
  basket, no Lottie).

## Current slots (little dog)

| File | Animation |
| --- | --- |
| `1-idle.json`  | Smiling Dog |
| `1-happy.json` | Happy Dog |
| `1-sick.json`  | Angry Dog |
| `2-idle.json`  | Astronaut Dog |
| `2-happy.json` | Happy Unicorn Dog |
| `flirting-dog.json` | Flirting Dog (bonus, not yet wired to a slot) |

Gaps (`1-sleep`, `2-sick`, `2-sleep`, …) intentionally fall back to the emoji
pet. Drop in more JSONs named `<stage>-<state>.json` to fill them, or re-map by
renaming files here.
