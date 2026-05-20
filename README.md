## Urania v1.0.0

A complete rebuild of Urania — new architecture, real astrology engine, and a fully redesigned UI.

---

### 🚀 What's New

**Architecture**
- Rebuilt as a static React SPA — no server or backend required
- Hash-based client-side routing
- LocalStorage session persistence

**UI & Design**
- Full glassmorphism dark cosmic design system
- Animated ScoreRing with conic gradient glow and count-up
- Animated mini-score bars with easeOutExpo transitions
- Live Tweaks Panel — accent palette, ring speed, cosmic intensity, poster background
- fade-up entrance animations across all screens
- Hover micro-interactions on cards and buttons

**New Screens**
- Welcome screen with live ring preview
- Connection type selector (Compatibility / Self-discovery)
- Intentions chip selector (Love, Marriage, Friendship, Career, Growth, Healing)
- Chemistry breakdown (aspect, element, modality, polarity pillars)
- Self-discovery mode with personal dimension scores
- Sessions dashboard with aggregate stats

**Engine**
- Real astrology logic replacing v0 placeholder
- Aspect scoring: Trine, Sextile, Conjunction, Opposition, Square, Quincunx
- Element, modality, polarity compatibility matrices
- Intention-weighted overall score
- Sinhala sign names included
- Fully deterministic — same inputs, same output

**Poster Export**
- 4 background variants: Nebula, Twilight, Magenta Wash, Cool Minimal
- Starfield overlay, aspect glyph, sign blocks
- PNG export at 1080 × 1350

---

### 📦 Files
- `Urania.html` — entry point
- `app.jsx` — app shell & routing
- `engine.js` — compatibility engine
- `components.jsx` — UI components
- `screens.jsx` — all screens
- `share.jsx` — poster & dashboard
- `tweaks-panel.jsx` — live design controls

---

> Built by Jithma · All rights reserved
