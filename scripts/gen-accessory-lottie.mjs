/**
 * Generates the pet's accessory animations — one cute vector accessory per
 * shop item — and writes them to public/lottie/accessory/.
 *
 *   node scripts/gen-accessory-lottie.mjs
 *
 * Output files: `<id>.json`  (crown | party | flower | bow | bell)
 *
 * Each accessory is drawn on the SAME 256×256 canvas as the pet
 * (scripts/gen-pet-lottie.mjs) and registered to the pet's head / neck so the
 * app can overlay it on the pet at the exact same box and it looks *worn* —
 * no per-item CSS offset maths. Hats rest on the head crown (~y52); collar
 * items sit at the neck (~y160). See the pet head geometry: head ellipse is
 * centred (128,102) size 122×112 → crown ≈ y46; body top ≈ y132.
 *
 * The Lottie carries only the accessory's own "accent" loop (crown sparkle,
 * party confetti, flower sway, bow wiggle, bell jingle). The gentle bob that
 * keeps the accessory glued to the bobbing pet is applied by the component
 * wrapper (shared idle motion), so it stays in sync across all pet states.
 *
 * Lottie schema mirrors the app's known-good files: v5.4.4, fr 30, colours as
 * normalized [r,g,b,1].
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "lottie", "accessory");
mkdirSync(OUT, { recursive: true });

// ── colour helpers ──────────────────────────────────────────────────────────
const rgb = (r, g, b) => [r / 255, g / 255, b / 255, 1];
const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return rgb((n >> 16) & 255, (n >> 8) & 255, n & 255);
};
const mix = (a, b, t) => a.map((v, i) => (i < 3 ? v + (b[i] - v) * t : 1));
const BLACK = [0, 0, 0, 1];
const line = (c) => mix(c, BLACK, 0.34); // outline tint from fill colour

// ── keyframe / property helpers ─────────────────────────────────────────────
const E = {
  io: { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } }, // smooth in-out
  out: { i: { x: [0.15], y: [1] }, o: { x: [0.35], y: [0] } }, // decel
  in: { i: { x: [0.65], y: [1] }, o: { x: [0.85], y: [0] } }, // accel
};
const k = (t, s, ease = E.io) => ({ t, s: typeof s === "number" ? [s] : s, i: ease.i, o: ease.o });
const anim = (kfs) => ({ a: 1, k: kfs });
const stat = (v) => ({ a: 0, k: v });

// ── shape item helpers ──────────────────────────────────────────────────────
const el = (cx, cy, w, h) => ({ ty: "el", d: 1, p: { a: 0, k: [cx, cy] }, s: { a: 0, k: [w, h] } });
const fill = (c, o = 100) => ({ ty: "fl", c: { a: 0, k: c }, o: { a: 0, k: o } });
const stroke = (c, w) => ({ ty: "st", c: { a: 0, k: c }, o: { a: 0, k: 100 }, w: { a: 0, k: w }, lc: 2, lj: 2 });
const path = (v, closed = true) => ({
  ty: "sh",
  ks: { a: 0, k: { c: closed, v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]) } },
});
// group transform. pivot doubles as anchor+position so rotation/scale spin in place.
const xf = ({ pivot = [0, 0], r, s, o, p } = {}) => ({
  ty: "tr",
  p: p || stat(pivot),
  a: stat(pivot),
  s: s || stat([100, 100]),
  r: r || stat(0),
  o: o || stat(100),
});
const group = (nm, items, tr) => ({ ty: "gr", nm, it: [...items, tr || xf()] });

// A filled (optionally stroked) ellipse as its own group.
function ellipseG(nm, cx, cy, w, h, color, { o = 100, sc, sw = 0, tr } = {}) {
  const items = [el(cx, cy, w, h), fill(color, o)];
  if (sw > 0) items.push(stroke(sc || line(color), sw));
  return group(nm, items, tr);
}
// A filled (optionally stroked) closed path as its own group.
function pathG(nm, v, color, { o = 100, sc, sw = 0, closed = true, tr } = {}) {
  const items = [path(v, closed), fill(color, o)];
  if (sw > 0) items.push(stroke(sc || line(color), sw));
  return group(nm, items, tr);
}

// Wrap a shape layer around the accessory's shape groups.
function accessoryLayer(nm, shapes, op) {
  return {
    ddd: 0, ind: 1, ty: 4, nm, sr: 1,
    ks: { o: stat(100), r: stat(0), p: stat([0, 0, 0]), a: stat([0, 0, 0]), s: stat([100, 100, 100]) },
    ao: 0, shapes, ip: 0, op, st: 0, bm: 0,
  };
}

// A four-point twinkle star (built around the origin) for sparkle FX.
function twinkle(nm, cx, cy, r, color, { oKf, sKf, rKf } = {}) {
  const v = [[0, -r], [r * 0.28, -r * 0.28], [r, 0], [r * 0.28, r * 0.28], [0, r], [-r * 0.28, r * 0.28], [-r, 0], [-r * 0.28, -r * 0.28]];
  const star = pathG(nm + "Shape", v.map(([x, y]) => [cx + x, cy + y]), color);
  return group(nm, [star], xf({ pivot: [cx, cy], o: oKf, s: sKf, r: rKf }));
}

// ── palette ──────────────────────────────────────────────────────────────────
const GOLD = hex("#F6C445");
const GOLD_HI = hex("#FFE39A");
const GOLD_SH = hex("#D89B24");
const RED = hex("#E85D6E");
const BLUE = hex("#5AA9E6");
const WHITE = hex("#FFFFFF");
const PINK = hex("#F0728F");
const PINK_HI = hex("#F79FB4");
const PINK_DK = hex("#D85578");
const PARTY = hex("#6FB1E0");
const PARTY_DK = hex("#4E93C7");
const POM = hex("#FF6B8A");
const LEAF = hex("#7FBF6A");
const YELLOW = hex("#FFD24C");
const CONF = [hex("#FF6B8A"), hex("#6FD3C0"), hex("#FFD24C"), hex("#8E7BE8"), hex("#5AA9E6")];

// Head crown ≈ y52 · neck ≈ y160 (canvas 256, matches gen-pet-lottie geometry).
const OP = 90; // 3s loop @ fr30 — matches the pet's idle cadence.

// ── crown ─────────────────────────────────────────────────────────────────────
function buildCrown() {
  // Zig-zag band resting on the head crown, three jewelled tips.
  const band = [
    [98, 66], [102, 44], [116, 56], [128, 34], [140, 56], [154, 44], [158, 66],
  ];
  const shapes = [];
  // sparkles twinkle above two tips, out of phase
  shapes.push(
    twinkle("sparkleA", 156, 40, 11, GOLD_HI, {
      oKf: anim([k(0, 0), k(8, 100), k(22, 0), k(90, 0)]),
      sKf: anim([k(0, [30, 30]), k(10, [115, 115]), k(24, [30, 30]), k(90, [30, 30])]),
      rKf: anim([k(0, 0), k(90, 90)]),
    }),
  );
  shapes.push(
    twinkle("sparkleB", 108, 40, 9, WHITE, {
      oKf: anim([k(0, 0), k(45, 0), k(53, 100), k(66, 0), k(90, 0)]),
      sKf: anim([k(45, [30, 30]), k(55, [110, 110]), k(68, [30, 30]), k(90, [30, 30])]),
      rKf: anim([k(0, 0), k(90, 90)]),
    }),
  );
  // jewels on the tips
  shapes.push(ellipseG("jewelM", 128, 40, 11, 11, BLUE, { sc: line(BLUE), sw: 2 }));
  shapes.push(ellipseG("jewelL", 102, 48, 9, 9, RED, { sc: line(RED), sw: 2 }));
  shapes.push(ellipseG("jewelR", 154, 48, 9, 9, RED, { sc: line(RED), sw: 2 }));
  // band highlight + body
  shapes.push(pathG("bandHi", band.map(([x, y]) => [x, y - 3]), GOLD_HI, { o: 70, closed: true }));
  shapes.push(pathG("band", band, GOLD, { sc: GOLD_SH, sw: 4 }));
  // base rim jewels
  shapes.push(ellipseG("gemA", 112, 62, 6, 6, RED, {}));
  shapes.push(ellipseG("gemB", 128, 64, 6, 6, BLUE, {}));
  shapes.push(ellipseG("gemC", 144, 62, 6, 6, RED, {}));
  return accessoryLayer("crown", shapes, OP);
}

// ── party hat ──────────────────────────────────────────────────────────────────
function buildParty() {
  const shapes = [];
  // confetti bits rising & spinning around the hat, staggered
  const bits = [
    { x: 92, y: 44, c: CONF[0], t0: 0 },
    { x: 168, y: 40, c: CONF[1], t0: 30 },
    { x: 150, y: 20, c: CONF[2], t0: 55 },
    { x: 104, y: 22, c: CONF[3], t0: 15 },
  ];
  bits.forEach((b, i) => {
    shapes.push(
      group(
        `conf${i}`,
        [pathG(`conf${i}s`, [[b.x - 4, b.y - 4], [b.x + 4, b.y - 4], [b.x + 4, b.y + 4], [b.x - 4, b.y + 4]], b.c)],
        xf({
          pivot: [b.x, b.y],
          o: anim([k(b.t0 % OP, 0), k((b.t0 + 8) % OP || 8, 100), k((b.t0 + 30) % OP || 30, 100), k((b.t0 + 40) % OP || 40, 0), k(OP, 0)]),
          p: anim([k(b.t0 % OP, [b.x, b.y + 6]), k((b.t0 + 40) % OP || 40, [b.x, b.y - 10]), k(OP, [b.x, b.y + 6])]),
          r: anim([k(0, 0), k(OP, 180)]),
        }),
      ),
    );
  });
  // pom-pom on top, gentle bounce
  shapes.push(
    ellipseG("pom", 132, 8, 15, 15, POM, {
      sc: line(POM), sw: 2,
      tr: xf({ pivot: [132, 8], s: anim([k(0, [100, 100]), k(30, [116, 88]), k(60, [92, 112]), k(90, [100, 100])]) }),
    }),
  );
  // cone (tilted) with two white zig stripes
  const cone = [[132, 12], [152, 60], [108, 60]];
  shapes.push(pathG("stripe2", [[126, 30], [136, 30], [140, 44], [122, 44]], WHITE, { o: 90 }));
  shapes.push(pathG("stripe1", [[120, 46], [144, 46], [148, 60], [113, 60]], WHITE, { o: 90 }));
  shapes.push(pathG("cone", cone, PARTY, { sc: PARTY_DK, sw: 4 }));
  // brim ellipse hugging the head
  shapes.push(ellipseG("brim", 128, 60, 52, 15, PARTY_DK));
  return accessoryLayer("party", shapes, OP);
}

// ── flower (tucked by the ear) ─────────────────────────────────────────────────
function buildFlower() {
  // Whole flower sways about a stem base by the right ear.
  const cx = 156, cy = 48, pr = 15, pw = 15, ph = 20;
  const petals = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(a) * pr, py = cy + Math.sin(a) * pr;
    petals.push(ellipseG(`petal${i}`, px, py, pw, ph, PINK, { sc: PINK_DK, sw: 2, tr: xf({ pivot: [px, py], r: stat((a * 180) / Math.PI + 90) }) }));
  }
  const centre = ellipseG("core", cx, cy, 16, 16, YELLOW, { sc: hex("#E0A93A"), sw: 2 });
  const leaf = ellipseG("leaf", cx - 12, cy + 20, 16, 9, LEAF, { sc: line(LEAF), sw: 2, tr: xf({ pivot: [cx - 12, cy + 20], r: stat(-30) }) });
  const flower = group(
    "flower",
    [centre, ...petals, leaf],
    xf({ pivot: [cx, cy + 24], r: anim([k(0, -6), k(45, 6), k(90, -6)]) }),
  );
  return accessoryLayer("flower", [flower], OP);
}

// ── bow (collar) ──────────────────────────────────────────────────────────────
function buildBow() {
  const cx = 128, cy = 160;
  const loopL = pathG("loopL", [[cx - 2, cy], [cx - 26, cy - 13], [cx - 26, cy + 13]], PINK, { sc: PINK_DK, sw: 3 });
  const loopR = pathG("loopR", [[cx + 2, cy], [cx + 26, cy - 13], [cx + 26, cy + 13]], PINK, { sc: PINK_DK, sw: 3 });
  const hiL = pathG("hiL", [[cx - 6, cy], [cx - 22, cy - 8], [cx - 22, cy + 2]], PINK_HI, { o: 70 });
  const hiR = pathG("hiR", [[cx + 6, cy], [cx + 22, cy - 8], [cx + 22, cy + 2]], PINK_HI, { o: 70 });
  const tailL = pathG("tailL", [[cx - 3, cy + 3], [cx - 12, cy + 26], [cx - 2, cy + 22]], PINK, { sc: PINK_DK, sw: 3 });
  const tailR = pathG("tailR", [[cx + 3, cy + 3], [cx + 12, cy + 26], [cx + 2, cy + 22]], PINK, { sc: PINK_DK, sw: 3 });
  const knot = ellipseG("knot", cx, cy, 15, 18, PINK_DK, { sc: line(PINK_DK), sw: 2 });
  const bow = group(
    "bow",
    [hiL, hiR, knot, loopL, loopR, tailL, tailR],
    xf({
      pivot: [cx, cy],
      r: anim([k(0, -4), k(22, 5), k(45, -4), k(68, 5), k(90, -4)]),
      s: anim([k(0, [100, 100]), k(45, [104, 96]), k(90, [100, 100])]),
    }),
  );
  return accessoryLayer("bow", [bow], OP);
}

// ── bell (collar) ───────────────────────────────────────────────────────────────
function buildBell() {
  const cx = 128, topY = 144;
  // Bell body: rounded trapezoid via a path, gold with highlight.
  const body = [
    [cx - 22, 172], [cx - 16, 150], [cx, 146], [cx + 16, 150], [cx + 22, 172],
  ];
  const parts = [];
  parts.push(pathG("bellHi", [[cx - 8, 152], [cx - 3, 152], [cx - 5, 170], [cx - 11, 170]], GOLD_HI, { o: 70 }));
  parts.push(pathG("bell", body, GOLD, { sc: GOLD_SH, sw: 4 }));
  parts.push(ellipseG("rim", cx, 174, 46, 12, GOLD, { sc: GOLD_SH, sw: 4 }));
  parts.push(ellipseG("clapper", cx, 180, 10, 10, GOLD_SH));
  parts.push(ellipseG("loop", cx, 143, 12, 12, GOLD, { sc: GOLD_SH, sw: 4 }));
  const jingle = anim([k(0, 0), k(12, -11), k(28, 8), k(44, -5), k(60, 3), k(74, -1), k(90, 0)]);
  const bell = group("bell", parts, xf({ pivot: [cx, topY], r: jingle }));
  return accessoryLayer("bell", [bell], OP);
}

// ── generate all ──────────────────────────────────────────────────────────────
const BUILDERS = { crown: buildCrown, party: buildParty, flower: buildFlower, bow: buildBow, bell: buildBell };

function doc(id, layers) {
  return { v: "5.4.4", fr: 30, ip: 0, op: OP, w: 256, h: 256, nm: id, ddd: 0, assets: [], markers: [], layers: [layers] };
}

let count = 0;
for (const [id, build] of Object.entries(BUILDERS)) {
  writeFileSync(join(OUT, `${id}.json`), JSON.stringify(doc(id, build())));
  count++;
}
console.log(`Wrote ${count} accessory Lottie files to ${OUT}`);
