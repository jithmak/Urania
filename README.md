# Urania · v2

> A calmer way to read the stars.

Urania is a single-file React SPA for astrological compatibility and self-reading. Two birth charts, a few intentions, one honest reading — no bundler, no backend, no mysticism overload. Shareable as a 1080×1350 poster.

---

## Features

- **Compatibility reading** — enter two birth profiles (date, time, place, optional Lagna) and get a scored breakdown across five dimensions
- **Self reading** — single-profile mode with a zodiac-focused deep dive
- **Intention weighting** — pick from Love, Marriage, Friendship, Career, Growth, or Healing to tilt the dimension weights toward what matters
- **Animated results** — count-up score ring, animated dimension bars, highlighted strengths and watch-outs
- **Share poster** — export a 1080×1350 PNG via `html-to-image`; four background variants (Nebula, Twilight, Magenta Wash, Cool Minimal)
- **Session dashboard** — save, reopen, and delete past readings from `localStorage`
- **Tweaks panel** — live-adjust cosmic intensity, ring spin speed, accent palette (5 presets), and poster background — all persisted to `localStorage`
- **Milky Way background** — diagonal band of overlapping ellipses, drifting spiral-arm nebulae, multi-tinted star fields
- **OrbitingPlanets** — two glowing orbs with comet tails orbiting a pulsing center dot on the Welcome screen
- **Cosmic sparkles** — 80 twinkling star particles on result screens, fixed behind card content
- **Zero dependencies at build time** — no Node, no bundler, no `npm install`

---

## Project structure

```
urania_v1.0/
├── Urania.html          # Entry point — loads React, Babel, and all modules
├── engine.js            # Pure-JS astrology engine (deterministic, no JSX)
├── app.jsx              # App shell, state machine, routing, persistence
├── screens.jsx          # All screens + OrbitingPlanets component
├── components.jsx       # Shared UI components (ScoreRing, Card, BirthChartWheel, CosmicSparkles…)
├── share.jsx            # ShareScreen, Poster (export), DashboardScreen
├── tweaks-panel.jsx     # TweaksPanel + tweak control components
└── styles/
    ├── app.css          # All styles, animations, CSS custom properties
    └── colors_and_type.css
```

### File responsibilities

| File | Role |
|---|---|
| `engine.js` | Derives sun sign from DOB, computes aspect/element/modality/polarity/birth-hour scores, weights by intention, returns `{ overall, minis, strengths, watchouts, chemistry }` |
| `app.jsx` | Hash-based router (`#welcome → #type → #you → #partner → #intentions → #results → #share → #dashboard`), draft auto-save, session CRUD, tweak state |
| `screens.jsx` | One function per screen; `OrbitingPlanets` SVG component; `FeatureCard` |
| `components.jsx` | `ScoreRing`, `AnimatedBar`, `MiniScores`, `BirthChartWheel`, `CosmicSparkles`, `Card`, `Button`, `PageHeading`, `SignBadge`, `ProfileCard`, `HighlightsPanel`, `Pillar`, `IntentionChip` |
| `share.jsx` | `Poster` (1080×1350 offscreen div → PNG), `ShareScreen`, `DashboardScreen` |
| `tweaks-panel.jsx` | `useTweaks` hook (localStorage), `TweaksPanel`, `TweakSlider`, `TweakToggle`, `TweakRadio`, `TweakColor`, `TweakSelect` |

---

## Running locally

Open `Urania.html` directly in a browser — no server required.

```bash
open /path/to/urania_v1.0/Urania.html
# or on Linux:
xdg-open /path/to/urania_v1.0/Urania.html
```

> **Cache note:** All JSX modules are cache-busted with `?v=2.4`. When making changes, increment this version in `Urania.html` to force the browser to reload the updated files.

---

## Engine — how scores work

The engine (`engine.js`) is a **closed, deterministic system** — identical inputs always produce identical scores.

### Inputs
```js
you / partner = { dob: "YYYY-MM-DD", time: "HH:MM", place: string, lagna: string }
intentions    = ["Love", "Career", …]   // subset of 6 options
```

### Scoring pipeline

1. **Sign derivation** — tropical western zodiac from DOB date range (or override with Lagna)
2. **Aspect** — sign distance mod 12 → conjunct (0), sextile (2), trine (4), opposite (6), square (3), quincunx (5/7)
3. **Element compatibility** — Fire/Earth/Air/Water affinity matrix
4. **Modality compatibility** — Cardinal/Fixed/Mutable pairing
5. **Polarity** — Yang/Yin complementarity
6. **Birth-hour resonance** — time of day mapped to planetary hours
7. **Mini-scores** — each of the five dimensions (Emotional, Intellectual, Physical, Spiritual, Long-term) weights the above factors differently
8. **Intention tilt** — selected intentions re-weight dimension contributions to the overall score

### Output shape
```js
{
  overall: 0–100,
  minis: [{ label, score, icon }],   // 5 dimensions
  strengths: [string],
  watchouts: [string],
  chemistry: { you: { sign, glyph, element, … }, partner: { … } }
}
```

---

## Theming

All colours flow through four CSS custom properties set by `app.jsx`:

```css
--accent-1   /* primary   — default: #8b5cf6 violet  */
--accent-2   /* secondary — default: #22d3ee cyan     */
--accent-3   /* tertiary  — default: #d946ef fuchsia  */
--accent-4   /* quaternary— default: #ec4899 pink     */
```

Additional properties:
```css
--cosmic-strength   /* 0 | 0.5 | 1  — background nebula opacity */
--ring-speed        /* CSS duration for ring spin, e.g. 8s       */
```

Switch palettes with the **Tweaks panel** (bottom-right gear icon):

| Palette | accent-1 | accent-2 | accent-3 | accent-4 |
|---|---|---|---|---|
| Cosmic (default) | `#8b5cf6` | `#22d3ee` | `#d946ef` | `#ec4899` |
| Aurora | `#6366f1` | `#06b6d4` | `#a855f7` | `#f0abfc` |
| Solar | `#ef4444` | `#f59e0b` | `#ec4899` | `#fb7185` |
| Oceanic | `#10b981` | `#06b6d4` | `#3b82f6` | `#a78bfa` |
| Magenta | `#a855f7` | `#ec4899` | `#f43f5e` | `#fb923c` |

---

## Key components

### `OrbitingPlanets`
SVG + CSS animation component on the Welcome screen. Two glowing orbs (14px accent-1 CW at 12s, 10px accent-2 CCW at 8s) with conic-gradient comet tails orbit a pulsing 6px center dot. Dashed SVG orbit rings at r=90 and r=60. Pauses with the Tweaks ring-spin toggle via `.no-ring-spin` body class.

### `ScoreRing`
Conic-gradient ring (`--accent-1 → --accent-2 → --accent-3`) that animates from 0° to the score percentage on mount. The outer ring breathes with a `ring-glow-pulse` CSS animation; the inner pulse ring runs `ring-bloom` → `ring-breathe`.

### `CosmicSparkles`
80 deterministic twinkling star divs (`position: fixed`, `z-index: 1`) behind glassmorphism cards (`z-index: 2`). Seeded by index so positions are stable across renders.

### `BirthChartWheel`
Animated birth chart wheel — 5 concentric rings, 30° house lines, zodiac glyphs (♈–♓) in outer band, planet dots, slow rotation (`uraniaWheelSpin`). Used in the share poster.

### `Poster`
Off-screen 1080×1350 div rendered via React portal, then rasterised to PNG using `html-to-image`. Four background variants. Includes `CosmicSparkles` overlay (`position: absolute`).

---

## Persistence

| Key | Contents |
|---|---|
| `urania.sessions.v1` | `JSON` array of saved sessions (id, timestamp, type, you, partner, intentions, result) |
| `urania.draft.v1` | Current in-progress reading (flow, you, partner, intentions) — auto-saved on every change |
| `urania.tweaks.v1` | Tweak panel state (cosmicIntensity, ringSpin, ringSpeed, accent, posterBg) |

All data lives in `localStorage` — no network requests, no account required.

---

## Versioning

Cache-bust query strings in `Urania.html` (`?v=2.4`) force browsers to reload updated JSX files on hard-refresh. Increment when releasing changes to any module.

| Version | Changes |
|---|---|
| v2.4 | OrbitingPlanets component on WelcomeScreen |
| v2.3 | Milky Way background (diagonal nebula band, multi-tinted stars) |
| v2.2 | CosmicSparkles, ring glow animation, zodiac glyph glow, saveSession fix |
| v2.1 | v2 branding, fixed positioning, welcome star chart, poster wheels |
| v2.0 | Star chart background, removed PlanetaryPositionsCard |
| v1.x | Initial release |
