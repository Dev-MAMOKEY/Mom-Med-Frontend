import nativewindPreset from 'nativewind/preset';
import tokens from '../design-tokens.json' with { type: 'json' };

// ─── helpers ──────────────────────────────────────────────────────────────
/** Unwrap a W3C-style { value, ... } design token into its primitive value. */
const v = (t) => (t && typeof t === 'object' && 'value' in t ? t.value : t);

/** True for $-prefixed metadata keys ($schema, $description, $value, …). */
const isMeta = (k) => k.startsWith('$');

/** Flatten a group of value-wrapped tokens into a plain { key: primitive } map. */
const flatten = (group) =>
  Object.fromEntries(
    Object.entries(group)
      .filter(([k]) => !isMeta(k))
      .map(([k, t]) => [k, v(t)])
  );

/** "Pretendard, -apple-system, ..." → ["Pretendard", "-apple-system", ...] */
const splitFamily = (str) =>
  str.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));

/** { value: "15px", lineHeight: "22px" } → ["15px", { lineHeight: "22px" }] */
const toFontSize = (t) => {
  const opts = {};
  if (t.lineHeight) opts.lineHeight = t.lineHeight;
  if (t.letterSpacing) opts.letterSpacing = t.letterSpacing;
  if (t.fontWeight) opts.fontWeight = t.fontWeight;
  return Object.keys(opts).length ? [t.value, opts] : t.value;
};

const mapFontSize = (group, prefix = '') =>
  Object.fromEntries(
    Object.entries(group)
      .filter(([k]) => !isMeta(k))
      .map(([k, t]) => [prefix ? `${prefix}-${k}` : k, toFontSize(t)])
  );

// ─── theme mappings ───────────────────────────────────────────────────────
const colors = {
  // brand.* + neutral.* + semantic.* are flattened to the top level
  // so `text-primary`, `bg-surface`, `bg-success` work as expected.
  ...flatten(tokens.color.brand),
  ...flatten(tokens.color.neutral),
  ...flatten(tokens.color.semantic),
  // severity/role keep their group prefix (e.g. bg-severity-경고, text-role-parent)
  severity: flatten(tokens.color.severity),
  role: flatten(tokens.color.role),
};

const fontFamily = Object.fromEntries(
  Object.entries(tokens.typography.fontFamily)
    .filter(([k]) => !isMeta(k))
    .map(([k, t]) => [k, splitFamily(v(t))])
);

const fontSize = {
  ...mapFontSize(tokens.typography.fontSize),
  // parent-only scale → text-parent-base, text-parent-lg, ...
  ...mapFontSize(tokens.typography['fontSize-parent'], 'parent'),
};

const borderRadius = flatten(tokens.radius);

// ─── config ───────────────────────────────────────────────────────────────
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    '../app/**/*.{js,jsx,ts,tsx}',
    '../components/**/*.{js,jsx,ts,tsx}',
    '../hooks/**/*.{ts,tsx}',
  ],
  presets: [nativewindPreset],
  theme: {
    extend: {
      colors,
      fontFamily,
      fontSize,
      borderRadius,
    },
  },
};
