/**
 * Generates the pet's Lottie animations — one cute vector dog per
 * skin × stage × state — and writes them to public/lottie/pet/.
 *
 *   node scripts/gen-pet-lottie.mjs
 *
 * Output files: `<skin>-<stage>-<state>.json`
 *   skins : classic | tuxedo | ginger | calico | gray   (see src/lib/pets.ts)
 *   stage : 1 (young puppy) | 2 (grown)
 *   state : idle | sleep | sick | happy                  (away shows a basket)
 *
 * The whole dog lives in one shape layer: whole-body motion (bob / bounce /
 * breathe / sway) is animated on the layer transform, while parts that move on
 * their own (tail wag, ear flop, blink, tongue) are animated on their group
 * transforms. FX (happy hearts) are separate layers stacked on top.
 *
 * Lottie schema mirrors the app's known-good files: v5.4.4, fr 30, colors as
 * normalized [r,g,b,1]. Canvas 256×256, dog centred near (128,128).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "lottie", "pet");
mkdirSync(OUT, { recursive: true });

// ── colour helpers ──────────────────────────────────────────────────────────
const rgb = (r, g, b) => [r / 255, g / 255, b / 255, 1];
const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return rgb((n >> 16) & 255, (n >> 8) & 255, n & 255);
};
const mix = (a, b, t) => a.map((v, i) => (i < 3 ? v + (b[i] - v) * t : 1));
const GREY = [0.63, 0.66, 0.63, 1];
const BLACK = [0, 0, 0, 1];
const WHITE = hex("#FFFFFF");
const sicken = (c) => mix(c, GREY, 0.42); // wan, desaturated look
const line = (c) => mix(c, BLACK, 0.32); // outline tint from body colour

// ── keyframe / property helpers ─────────────────────────────────────────────
const E = {
  io: { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } }, // smooth in-out
  out: { i: { x: [0.15], y: [1] }, o: { x: [0.35], y: [0] } }, // decel
  in: { i: { x: [0.65], y: [1] }, o: { x: [0.85], y: [0] } }, // accel
};
// bodymovin wraps every keyframe value in an array — including 1-D ones like rotation.
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

// ── stage geometry: puppy (1) is chibi — big head, big eyes, small body ──────
function adj(stage, region, cx, cy, w = 0, h = 0) {
  let x = cx, y = cy, W = w, H = h;
  if (stage === 1) {
    if (region === "head" || region === "eye") {
      const kk = 1.07, ox = 128, oy = 100; // enlarge head cluster about head centre
      x = ox + (x - ox) * kk; y = oy + (y - oy) * kk; W *= kk; H *= kk;
    }
    if (region === "body") {
      const kk = 0.9, ox = 128, oy = 184; // shrink body cluster about body centre
      x = ox + (x - ox) * kk; y = oy + (y - oy) * kk; W *= kk; H *= kk;
    }
    if (region === "eye") { W *= 1.16; H *= 1.16; } // extra-big puppy eyes
    const gk = 0.9, ox = 128, oy = 150; // overall shrink, then settle down
    x = ox + (x - ox) * gk; y = oy + (y - oy) * gk; W *= gk; H *= gk;
    y += 3;
  }
  return [x, y, W, H];
}

// ── per-skin palettes & features ────────────────────────────────────────────
const SKINS = {
  classic: { body: hex("#E8B074"), shade: hex("#D89F5E"), ear: hex("#CE8F4B"), muzzle: hex("#FBEBD2"), nose: hex("#3B2E28"), tongue: hex("#F28C99"), blush: hex("#F5A9A9"), feat: {} },
  tuxedo:  { body: hex("#3B3F49"), shade: hex("#2E313A"), ear: hex("#2A2D35"), muzzle: hex("#F4F6FA"), nose: hex("#20222A"), tongue: hex("#F28C99"), blush: hex("#E39A9A"), feat: { chest: true } },
  ginger:  { body: hex("#E07D3C"), shade: hex("#CD6E30"), ear: hex("#BF632A"), muzzle: hex("#F7E4CF"), nose: hex("#4A2F26"), tongue: hex("#F28C99"), blush: hex("#F3A98F"), feat: {} },
  calico:  { body: hex("#EFDFC4"), shade: hex("#E1CDA4"), ear: hex("#E7D5B4"), muzzle: hex("#F8EFDE"), nose: hex("#4A4038"), tongue: hex("#F28C99"), blush: hex("#F2C0B0"), feat: { poodle: true } },
  gray:    { body: hex("#9AA3AF"), shade: hex("#828B98"), ear: hex("#79828F"), muzzle: hex("#EEF1F5"), nose: hex("#2E3138"), tongue: hex("#F28C99"), blush: hex("#D7A9A9"), feat: { cap: true } },
};

// ── state → motion recipe ────────────────────────────────────────────────────
// Anchor sits low on the body so squash/sway pivot near the feet.
const ANCHOR = [128, 206, 0];

function stateMotion(state) {
  switch (state) {
    case "idle":
      return {
        op: 90,
        layer: {
          p: anim([k(0, [128, 206, 0]), k(45, [128, 201, 0]), k(90, [128, 206, 0])]),
        },
        tail: anim([k(0, -14), k(22, 16), k(45, -14), k(68, 16), k(90, -14)]),
        earBob: anim([k(0, 0), k(45, 4), k(90, 0)]),
        blink: anim([k(0, [100, 100]), k(58, [100, 100]), k(62, [100, 12]), k(66, [100, 100]), k(90, [100, 100])]),
        eyes: "open",
        mouth: "smile",
      };
    case "happy":
      return {
        op: 60,
        layer: {
          p: anim([k(0, [128, 206, 0], E.out), k(15, [128, 180, 0], E.in), k(30, [128, 206, 0], E.out), k(45, [128, 180, 0], E.in), k(60, [128, 206, 0])]),
          s: anim([k(0, [108, 92, 100]), k(15, [95, 107, 100]), k(30, [108, 92, 100]), k(45, [95, 107, 100]), k(60, [108, 92, 100])]),
        },
        tail: anim([k(0, -26), k(8, 26), k(16, -26), k(24, 26), k(32, -26), k(40, 26), k(48, -26), k(56, 26), k(60, -26)]),
        earBob: anim([k(0, 8), k(15, -8), k(30, 8), k(45, -8), k(60, 8)]),
        eyes: "happy",
        mouth: "tongue",
        fx: "hearts",
      };
    case "sleep":
      return {
        op: 120,
        layer: {
          p: anim([k(0, [128, 209, 0]), k(60, [128, 211, 0]), k(120, [128, 209, 0])]),
          s: anim([k(0, [100, 100, 100]), k(60, [104, 96, 100]), k(120, [100, 100, 100])]),
        },
        tail: stat(-30),
        eyes: "closed",
        mouth: "none",
      };
    case "sick":
      return {
        op: 120,
        sick: true,
        layer: {
          p: anim([k(0, [128, 211, 0]), k(60, [128, 213, 0]), k(120, [128, 211, 0])]),
          r: anim([k(0, -3), k(60, 3), k(120, -3)]),
        },
        tail: stat(-8),
        eyes: "half",
        mouth: "none",
        brows: true,
        fx: "sweat",
      };
  }
}

// ── build one dog layer's shape groups (front → back) ────────────────────────
function dogShapes(pal, stage, m) {
  const A = (region, cx, cy, w, h) => adj(stage, region, cx, cy, w, h);
  const P = (region, x, y) => { const [ax, ay] = adj(stage, region, x, y); return [ax, ay]; };
  const g = [];

  const eyeMode = m.eyes;
  const eyeScale =
    eyeMode === "closed" ? [100, 12] : eyeMode === "half" ? [100, 55] : eyeMode === "happy" ? [100, 78] : [100, 100];

  // Worried brows (sick) — inner ends raised, outer ends dropped
  if (m.brows) {
    const bl = [P("head", 92, 90), P("head", 112, 84)];
    const br = [P("head", 144, 84), P("head", 164, 90)];
    g.push(group("browL", [path(bl, false), stroke(pal.nose, 4)]));
    g.push(group("browR", [path(br, false), stroke(pal.nose, 4)]));
  }

  // Eyes (dark oval + white highlight), with blink/expression scale
  for (const [nm, ex, hx] of [["eyeL", 102, 105], ["eyeR", 154, 157]]) {
    const [cx, cy, w, h] = A("eye", ex, 100, 17, 21);
    const [hlx, hly, hw, hh] = A("eye", hx, 95, 6, 6);
    const tr = xf({
      pivot: [cx, cy],
      s: m.blink && eyeMode === "open" ? m.blink : stat(eyeScale),
    });
    const iris = group("iris", [el(cx, cy, w, h), fill(pal.nose)]);
    const parts = [iris];
    if (eyeMode !== "closed") parts.push(group("shine", [el(hlx, hly, hw, hh), fill(WHITE)]));
    g.push(group(nm, parts, tr));
  }

  // Nose
  {
    const [cx, cy, w, h] = A("head", 128, 120, 27, 19);
    g.push(ellipseG("nose", cx, cy, w, h, pal.nose));
  }

  // Tongue (happy)
  if (m.mouth === "tongue") {
    const [cx, cy, w, h] = A("head", 128, 148, 26, 24);
    g.push(ellipseG("tongue", cx, cy, w, h, pal.tongue, { sc: line(pal.tongue), sw: 2 }));
  }

  // Muzzle
  {
    const [cx, cy, w, h] = A("head", 128, 134, 72, 56);
    g.push(ellipseG("muzzle", cx, cy, w, h, pal.muzzle));
  }

  // Blush cheeks
  for (const [nm, bx] of [["blushL", 90], ["blushR", 166]]) {
    const [cx, cy, w, h] = A("head", bx, 122, 22, 13);
    g.push(ellipseG(nm, cx, cy, w, h, pal.blush, { o: 60 }));
  }

  // Poodle topknot
  if (pal.feat.poodle) {
    const [cx, cy, w, h] = A("head", 128, 54, 68, 54);
    g.push(ellipseG("topknot", cx, cy, w, h, mix(pal.body, WHITE, 0.25), { sc: line(pal.body), sw: 3 }));
  }
  // Husky cap (darker forehead)
  if (pal.feat.cap) {
    const [cx, cy, w, h] = A("head", 128, 80, 118, 74);
    g.push(ellipseG("cap", cx, cy, w, h, pal.shade));
  }

  // Head
  {
    const [cx, cy, w, h] = A("head", 128, 102, 122, 112);
    g.push(ellipseG("head", cx, cy, w, h, pal.body, { sc: line(pal.body), sw: 4 }));
  }

  // Ears — floppy ovals, or round poms for the poodle. Wag/flop via earBob.
  const earR = m.earBob;
  for (const [nm, sign, ex, ey] of [["earL", -1, 66, 108], ["earR", 1, 190, 108]]) {
    const pivot = P("head", 128 + sign * 46, 66);
    if (pal.feat.poodle) {
      const [cx, cy, w, h] = A("head", ex, ey, 56, 56);
      g.push(ellipseG(nm, cx, cy, w, h, pal.ear, { sc: line(pal.body), sw: 3, tr: xf({ pivot, r: earR }) }));
    } else {
      const [cx, cy, w, h] = A("head", ex + sign * 0, ey, 44, 70);
      const base = sign * 14; // floppy outward
      const r = earR
        ? anim(earR.k.map((kf) => ({ ...kf, s: [base + (Array.isArray(kf.s) ? kf.s[0] : kf.s) * sign] })))
        : stat(base);
      g.push(ellipseG(nm, cx, cy, w, h, pal.ear, { sc: line(pal.body), sw: 3, tr: xf({ pivot, r }) }));
    }
  }

  // Front paws
  for (const [nm, px] of [["pawL", 104], ["pawR", 152]]) {
    const [cx, cy, w, h] = A("body", px, 226, 34, 26);
    g.push(ellipseG(nm, cx, cy, w, h, pal.shade, { sc: line(pal.body), sw: 3 }));
  }

  // Chest patch (tuxedo)
  if (pal.feat.chest) {
    const [cx, cy, w, h] = A("body", 128, 182, 58, 86);
    g.push(ellipseG("chest", cx, cy, w, h, pal.muzzle));
  }

  // Body
  {
    const [cx, cy, w, h] = A("body", 128, 182, 126, 100);
    g.push(ellipseG("body", cx, cy, w, h, pal.body, { sc: line(pal.body), sw: 4 }));
  }

  // Tail — wags via rotation about its base pivot.
  {
    const pivot = P("body", 188, 184);
    if (pal.feat.poodle) {
      const [cx, cy, w, h] = A("body", 214, 158, 40, 40);
      g.push(ellipseG("tail", cx, cy, w, h, pal.ear, { sc: line(pal.body), sw: 3, tr: xf({ pivot, r: m.tail }) }));
    } else {
      const [cx, cy, w, h] = A("body", 214, 162, 28, 48);
      g.push(ellipseG("tail", cx, cy, w, h, pal.body, { sc: line(pal.body), sw: 4, tr: xf({ pivot, r: m.tail }) }));
    }
  }

  return g;
}

// ── FX layers (rendered above the dog) ───────────────────────────────────────
function heartLayer(ind, x0, startFrame, op) {
  // heart built around the origin; the layer position floats it up beside the head
  const lobeL = el(-6, -6, 15, 15);
  const lobeR = el(6, -6, 15, 15);
  const point = path([[-11, -3], [11, -3], [0, 12]]);
  const heart = group("heart", [lobeL, lobeR, point, fill(hex("#FF6B8A"))]);
  const dur = 38, yStart = 150, yEnd = 84;
  return {
    ddd: 0, ind, ty: 4, nm: "heart", sr: 1,
    ks: {
      o: anim([k(startFrame, [0]), k(startFrame + 7, [100]), k(startFrame + dur - 9, [100]), k(startFrame + dur, [0])]),
      r: stat(0),
      p: anim([k(startFrame, [x0, yStart, 0], E.out), k(startFrame + dur, [x0, yEnd, 0])]),
      a: stat([0, 0, 0]),
      s: anim([k(startFrame, [40, 40, 100], E.out), k(startFrame + 11, [110, 110, 100]), k(startFrame + dur, [85, 85, 100])]),
    },
    ao: 0, shapes: [heart], ip: 0, op, st: 0, bm: 0,
  };
}

function sweatLayer(ind, op) {
  // teardrop = small blue ellipse sliding down the temple, looping
  const drop = group("drop", [el(0, 0, 12, 16), fill(hex("#7EC8E3"))]);
  return {
    ddd: 0, ind, ty: 4, nm: "sweat", sr: 1,
    ks: {
      o: anim([k(0, [0]), k(10, [90]), k(40, [90]), k(52, [0]), k(120, [0])]),
      r: stat(0),
      p: anim([k(0, [176, 108, 0], E.in), k(52, [184, 150, 0]), k(120, [184, 150, 0])]),
      a: stat([0, 0, 0]),
      s: stat([100, 100, 100]),
    },
    ao: 0, shapes: [drop], ip: 0, op, st: 0, bm: 0,
  };
}

// ── assemble one animation file ──────────────────────────────────────────────
function build(skinName, stage, state) {
  const base = SKINS[skinName];
  const m = stateMotion(state);
  const pal = m.sick
    ? { ...base, body: sicken(base.body), shade: sicken(base.shade), ear: sicken(base.ear), muzzle: sicken(base.muzzle) }
    : base;

  const dog = {
    ddd: 0, ind: 20, ty: 4, nm: "dog", sr: 1,
    ks: {
      o: stat(100),
      r: m.layer.r || stat(0),
      p: m.layer.p || stat([128, 206, 0]),
      a: stat(ANCHOR),
      s: m.layer.s || stat([100, 100, 100]),
    },
    ao: 0, shapes: dogShapes(pal, stage, m), ip: 0, op: m.op, st: 0, bm: 0,
  };

  const layers = [];
  if (m.fx === "hearts") {
    layers.push(heartLayer(1, 158, 2, m.op));
    layers.push(heartLayer(2, 100, 20, m.op));
  }
  if (m.fx === "sweat") layers.push(sweatLayer(3, m.op));
  layers.push(dog);

  return {
    v: "5.4.4", fr: 30, ip: 0, op: m.op, w: 256, h: 256,
    nm: `${skinName}-${stage}-${state}`, ddd: 0, assets: [], markers: [], layers,
  };
}

// ── generate all 40 ──────────────────────────────────────────────────────────
const STATES = ["idle", "sleep", "sick", "happy"];
let count = 0;
for (const skin of Object.keys(SKINS)) {
  for (const stage of [1, 2]) {
    for (const state of STATES) {
      const doc = build(skin, stage, state);
      writeFileSync(join(OUT, `${skin}-${stage}-${state}.json`), JSON.stringify(doc));
      count++;
    }
  }
}
console.log(`Wrote ${count} pet Lottie files to ${OUT}`);
