# Urania

Urania is a **modern compatibility dashboard** that blends astrology-inspired inputs with a clean, AI-style user experience.  
The product focuses on **clarity, aesthetics, and shareability**, rather than traditional horoscope complexity.

This repository contains **Version 0 (v0)** — a validated visual and UX prototype.

---

## 🎯 Project Goal

To explore a new way of presenting compatibility insights:

- Minimal, premium dashboard UI
- Simple input → result → share flow
- Share-ready visual output (poster format)
- Logic abstracted and replaceable

Urania v0 is **not** about perfect astrology logic — it is about proving:
> “Does this feel like a product people would enjoy using and sharing?”

---

## 🧭 What V0 Includes

### Core Flow
1. User enters two profiles (DOB, Time, optional Place & Lagna)
2. System generates a compatibility result
3. Results are shown in a clean dashboard
4. A shareable poster (PNG) can be downloaded

### Features
- Overall compatibility score
- Mini scores (Love, Trust, Communication, Growth, Energy)
- Strengths and Watch-outs
- Poster export (1080 × 1350)

---

## 🛠️ Tech Stack

- **Backend:** FastAPI (Python)
- **Templates:** Jinja2
- **Styling:** Tailwind CSS (CDN)
- **Export:** html-to-image (client-side PNG generation)
- **State (v0):** In-memory (latest result only)

No database.  
No authentication.  
No persistence.

---

## ⚠️ Important Notes (Read This)

- The compatibility logic in v0 is **placeholder / deterministic**
- Scores are intentionally demo-friendly
- This version validates **UX, flow, and visual language**
- Real astrology or dataset-driven logic is planned for later versions

---

## 🧠 Design Philosophy

- **Minimal first** — readability and confidence
- **Cosmic hints, not noise** — subtle AI / astrology accents
- **Motion over decoration** — intelligence shown through behavior, not visuals
- **Dashboard clean, poster expressive**

---

## 🗂️ Project Structure
urania/
├── app/
│ ├── main.py # FastAPI routes
│ ├── engine.py # Compatibility logic (v0 fake)
│ ├── models.py # Data models
│ ├── templates/ # Jinja2 HTML templates
│ └── static/ # JS, CSS, assets
├── requirements.txt
└── README.md


---

## 🚧 What Is NOT in V0

- User accounts
- Saved history
- Multiple sessions
- Real astrology calculations
- Analytics

These are intentionally excluded.

---

## 🛣️ Future Direction (High-Level)

### V1 — Logic
- Real compatibility engine
- Wider score distribution
- Dataset validation

### V2 — UI
- Animated score ring (SVG)
- Micro-interactions
- Optional theme modes (Minimal / Cosmic)

---

## 🔒 Repository Status

- Repository is **private**
- No license applied yet
- All rights reserved to the author

---

## 📌 Status

**Version:** v0  
**State:** Stable prototype  
**Focus:** UX, visual direction, shareability

---

Urania v0 establishes a strong foundation for future development, commercialization, or white-label use.

