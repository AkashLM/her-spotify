// Deterministic artwork: same title + description always gives the same design.
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let s = seed || 1;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

const PALETTES = [
  ['#ff6b81', '#6c2bd9'], ['#f093fb', '#f5576c'], ['#fda085', '#c2185b'], ['#ff9a9e', '#5b247a'],
  ['#fbc2eb', '#a18cd1'], ['#f6d365', '#e8546b'], ['#ee9ca7', '#3a1c71'], ['#ffafbd', '#2b5876'],
  ['#d4145a', '#fbb03b'], ['#e96443', '#904e95'], ['#ff758c', '#ff7eb3'], ['#c471ed', '#12c2e9'],
];

export const FALLBACK_ARTWORK = {
  id: 'fallback', angle: 135, colors: ['#1DB954', '#0b3d1e'],
  blobs: [{ x: 70, y: 30, r: 30, o: 0.25 }, { x: 25, y: 75, r: 24, o: 0.18 }],
  heart: { x: 50, y: 50, s: 1, o: 0.9, rot: 0 }, ring: null,
};

export function generateArtwork(title = '', description = '') {
  const seed = hash(`${title}|${description}`);
  const r = rng(seed);
  const colors = PALETTES[seed % PALETTES.length];
  const blobs = Array.from({ length: 3 + Math.floor(r() * 3) }, () => ({
    x: 10 + r() * 80, y: 10 + r() * 80, r: 12 + r() * 28, o: 0.12 + r() * 0.28,
  }));
  return {
    id: `a${seed.toString(36)}`,
    angle: Math.floor(r() * 360),
    colors,
    blobs,
    heart: r() > 0.35 ? { x: 30 + r() * 40, y: 30 + r() * 40, s: 0.5 + r() * 0.7, o: 0.55 + r() * 0.35, rot: (r() - 0.5) * 40 } : null,
    ring: r() > 0.5 ? { x: 20 + r() * 60, y: 20 + r() * 60, r: 18 + r() * 22 } : null,
  };
}
