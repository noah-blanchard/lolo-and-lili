/**
 * Generates the "take the dog out" animation assets and writes them to
 * public/lottie/pet/.
 *
 *   node scripts/gen-walk-lottie.mjs
 *
 * Output:
 *   walk-side.json — a looping side-profile walk cycle (dog faces right). The
 *                    overlay slides this across the screen with CSS; the Lottie
 *                    only supplies the leg/tail/ear cycle + a gentle body bob.
 *   poop.json      — a little coiled poop with a looping steam wisp. Static
 *                    body (the overlay scales it in), steam loops.
 *
 * Lottie schema mirrors the app's known-good files (v5.4.4, fr 30, colours as
 * normalized [r,g,b,1]); helper style mirrors scripts/gen-accessory-lottie.mjs.
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
const BLACK = [0, 0, 0, 1];
const line = (c) => mix(c, BLACK, 0.34);

// ── keyframe / property helpers ─────────────────────────────────────────────
const E = {
  io: { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } },
  out: { i: { x: [0.15], y: [1] }, o: { x: [0.35], y: [0] } },
  in: { i: { x: [0.65], y: [1] }, o: { x: [0.85], y: [0] } },
};
const k = (t, s, ease = E.io) => ({ t, s: typeof s === "number" ? [s] : s, i: ease.i, o: ease.o });
const anim = (kfs) => ({ a: 1, k: kfs });
const stat = (v) => ({ a: 0, k: v });

// ── shape item helpers ──────────────────────────────────────────────────────
const el = (cx, cy, w, h) => ({ ty: "el", d: 1, p: { a: 0, k: [cx, cy] }, s: { a: 0, k: [w, h] } });
const rc = (cx, cy, w, h, r = 0) => ({ ty: "rc", d: 1, p: { a: 0, k: [cx, cy] }, s: { a: 0, k: [w, h] }, r: { a: 0, k: r } });
const fill = (c, o = 100) => ({ ty: "fl", c: { a: 0, k: c }, o: { a: 0, k: o } });
const stroke = (c, w) => ({ ty: "st", c: { a: 0, k: c }, o: { a: 0, k: 100 }, w: { a: 0, k: w }, lc: 2, lj: 2 });
const path = (v, closed = true) => ({
  ty: "sh",
  ks: { a: 0, k: { c: closed, v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]) } },
});
const xf = ({ pivot = [0, 0], r, s, o, p } = {}) => ({
  ty: "tr",
  p: p || stat(pivot),
  a: stat(pivot),
  s: s || stat([100, 100]),
  r: r || stat(0),
  o: o || stat(100),
});
const group = (nm, items, tr) => ({ ty: "gr", nm, it: [...items, tr || xf()] });

function ellipseG(nm, cx, cy, w, h, color, { o = 100, sc, sw = 0, tr } = {}) {
  const items = [el(cx, cy, w, h), fill(color, o)];
  if (sw > 0) items.push(stroke(sc || line(color), sw));
  return group(nm, items, tr);
}
function strokePathG(nm, v, color, w, { tr, closed = false } = {}) {
  return group(nm, [path(v, closed), stroke(color, w)], tr);
}

function layerOf(nm, shapes, op, { p } = {}) {
  return {
    ddd: 0, ind: 1, ty: 4, nm, sr: 1,
    ks: { o: stat(100), r: stat(0), p: p || stat([0, 0, 0]), a: stat([0, 0, 0]), s: stat([100, 100, 100]) },
    ao: 0, shapes, ip: 0, op, st: 0, bm: 0,
  };
}
function doc(nm, layer, w, h, op) {
  return { v: "5.4.4", fr: 30, ip: 0, op, w, h, nm, ddd: 0, assets: [], markers: [], layers: [layer] };
}

// ── palette (classic dog, matches gen-pet-lottie) ────────────────────────────
const BODY = hex("#E8B074");
const SHADE = hex("#D89F5E");
const EAR = hex("#CE8F4B");
const MUZZLE = hex("#FBEBD2");
const NOSE = hex("#3B2E28");
const WHITE = hex("#FFFFFF");
const LEG_FAR = mix(SHADE, BLACK, 0.22);

// ── walk-side.json ───────────────────────────────────────────────────────────
const WALK_OP = 30; // 1s brisk walk loop (2 steps), fr30

function legG(nm, px, py, len, color, rKf, w = 15) {
  return group(
    nm,
    [
      rc(px, py + len / 2, w, len, w / 2),
      fill(color),
      stroke(line(color), 2),
      // paw
      el(px, py + len, w + 3, 10),
      fill(color),
    ],
    xf({ pivot: [px, py], r: rKf }),
  );
}

function buildWalk() {
  // Diagonal gait: (near-front + far-back) swing opposite to (far-front + near-back).
  const rA = anim([k(0, 22), k(15, -22), k(30, 22)]);
  const rB = anim([k(0, -22), k(15, 22), k(30, -22)]);
  const rTail = anim([k(0, -14), k(15, 14), k(30, -14)]);
  const rEar = anim([k(0, 6), k(15, -6), k(30, 6)]);

  const FRONT_X = 162, BACK_X = 74, HIP_Y = 120, LEN = 40;

  const shapes = [];
  // near legs (in front of body)
  shapes.push(legG("legNearFront", FRONT_X, HIP_Y, LEN, SHADE, rA));
  shapes.push(legG("legNearBack", BACK_X, HIP_Y, LEN, SHADE, rB));
  // head cluster (in front of body)
  shapes.push(ellipseG("nose", 224, 88, 10, 9, NOSE));
  shapes.push(ellipseG("muzzle", 210, 92, 34, 26, MUZZLE, { sc: line(MUZZLE), sw: 2 }));
  shapes.push(ellipseG("mouth", 214, 100, 16, 4, line(MUZZLE)));
  shapes.push(ellipseG("eye", 189, 78, 8, 10, NOSE));
  shapes.push(ellipseG("eyeShine", 191, 75, 3, 3, WHITE));
  shapes.push(ellipseG("head", 182, 84, 66, 62, BODY, { sc: line(BODY), sw: 4 }));
  shapes.push(ellipseG("ear", 170, 62, 26, 42, EAR, { sc: line(BODY), sw: 3, tr: xf({ pivot: [176, 56], r: rEar }) }));
  // body
  shapes.push(ellipseG("body", 118, 104, 128, 74, BODY, { sc: line(BODY), sw: 4 }));
  // tail (behind body)
  shapes.push(ellipseG("tail", 44, 74, 20, 42, BODY, { sc: line(BODY), sw: 4, tr: xf({ pivot: [58, 92], r: rTail }) }));
  // far legs (behind body, darker)
  shapes.push(legG("legFarFront", FRONT_X + 9, HIP_Y, LEN, LEG_FAR, rB));
  shapes.push(legG("legFarBack", BACK_X + 9, HIP_Y, LEN, LEG_FAR, rA));

  // gentle 2-step body bob on the layer transform
  const p = anim([
    k(0, [0, 0, 0]), k(7, [0, -3, 0]), k(15, [0, 0, 0]), k(22, [0, -3, 0]), k(30, [0, 0, 0]),
  ]);
  return layerOf("dog-walk", shapes, WALK_OP, { p });
}

// ── poop.json ─────────────────────────────────────────────────────────────────
const POOP_OP = 60;
const POO = hex("#7A4A22");
const POO_HI = hex("#95602F");

function steamG(nm, x, y, delay) {
  const wave = [[x - 5, y + 6], [x + 4, y + 2], [x - 4, y - 3], [x + 5, y - 8]];
  return group(
    nm,
    [path(wave, false), stroke(mix(WHITE, POO, 0.15), 3)],
    xf({
      pivot: [x, y],
      o: anim([k(delay, 0), k(delay + 10, 65), k(delay + 26, 0), k(POOP_OP, 0)]),
      p: anim([k(delay, [0, 0]), k(delay + 30, [0, -12])]),
    }),
  );
}

function buildPoop() {
  const shapes = [];
  // steam wisps (on top), staggered
  shapes.push(steamG("steamA", 30, 18, 0));
  shapes.push(steamG("steamB", 44, 16, 30));
  // coiled mounds, largest at the bottom
  shapes.push(ellipseG("tip", 36, 24, 11, 11, POO, { sc: line(POO), sw: 2 }));
  shapes.push(ellipseG("hiTop", 33, 31, 7, 5, POO_HI));
  shapes.push(ellipseG("top", 36, 34, 22, 15, POO, { sc: line(POO), sw: 2 }));
  shapes.push(ellipseG("hiMid", 31, 42, 8, 5, POO_HI));
  shapes.push(ellipseG("mid", 36, 44, 32, 17, POO, { sc: line(POO), sw: 2 }));
  shapes.push(ellipseG("base", 36, 54, 42, 18, POO, { sc: line(POO), sw: 2 }));
  return layerOf("poop", shapes, POOP_OP);
}

// ── write ────────────────────────────────────────────────────────────────────
writeFileSync(join(OUT, "walk-side.json"), JSON.stringify(doc("dog-walk", buildWalk(), 240, 180, WALK_OP)));
writeFileSync(join(OUT, "poop.json"), JSON.stringify(doc("poop", buildPoop(), 72, 72, POOP_OP)));
console.log(`Wrote walk-side.json + poop.json to ${OUT}`);
