/* ============================================================
   Urania — Compatibility Engine (deterministic, astrology-based)
   ------------------------------------------------------------
   Inputs:
     you / partner = { dob: "YYYY-MM-DD", time: "HH:MM", place, lagna }
     intentions    = array of strings (Love, Marriage, ...)
   Output:
     { overall, minis[], strengths[], watchouts[], chemistry, you, partner }

   Logic (real astrology principles, scored deterministically):
     1. Derive sun sign from DOB (or use Lagna if given).
     2. Compute aspect (sign distance mod 12):
          0 conjunct, 2 sextile, 4 trine, 6 opposite,
          3 square, 5/7 quincunx, 1/11 semi
     3. Element compatibility (Fire/Earth/Air/Water).
     4. Modality compatibility (Cardinal/Fixed/Mutable).
     5. Polarity (yin/yang).
     6. Hour-of-day birth-time resonance.
     7. Mini-scores weight these differently per dimension.
     8. Intentions tilt the dimension weights for overall.

   This is deliberately a CLOSED, deterministic system —
   same inputs → identical scores every time.
   ============================================================ */

(function () {
  "use strict";

  // ---------- Sign tables ----------
  const SIGNS = [
    "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
    "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
  ];
  const SIGN_GLYPHS = {
    Aries:"♈", Taurus:"♉", Gemini:"♊", Cancer:"♋", Leo:"♌", Virgo:"♍",
    Libra:"♎", Scorpio:"♏", Sagittarius:"♐", Capricorn:"♑", Aquarius:"♒", Pisces:"♓"
  };
  const SIGN_SI = {
    Aries:"මේෂ", Taurus:"වෘෂභ", Gemini:"මිථුන", Cancer:"කටක",
    Leo:"සිංහ", Virgo:"කන්‍යා", Libra:"තුලා", Scorpio:"වෘශ්චික",
    Sagittarius:"ධනු", Capricorn:"මකර", Aquarius:"කුම්භ", Pisces:"මීන"
  };
  const ELEMENT = {
    Aries:"Fire", Leo:"Fire", Sagittarius:"Fire",
    Taurus:"Earth", Virgo:"Earth", Capricorn:"Earth",
    Gemini:"Air", Libra:"Air", Aquarius:"Air",
    Cancer:"Water", Scorpio:"Water", Pisces:"Water"
  };
  const MODALITY = {
    Aries:"Cardinal", Cancer:"Cardinal", Libra:"Cardinal", Capricorn:"Cardinal",
    Taurus:"Fixed", Leo:"Fixed", Scorpio:"Fixed", Aquarius:"Fixed",
    Gemini:"Mutable", Virgo:"Mutable", Sagittarius:"Mutable", Pisces:"Mutable"
  };
  // Yang = expressive, Yin = receptive
  const POLARITY = {
    Aries:"Yang", Gemini:"Yang", Leo:"Yang", Libra:"Yang", Sagittarius:"Yang", Aquarius:"Yang",
    Taurus:"Yin", Cancer:"Yin", Virgo:"Yin", Scorpio:"Yin", Capricorn:"Yin", Pisces:"Yin"
  };

  // Date ranges: tropical western zodiac
  function sunSignFromDOB(dob) {
    if (!dob) return null;
    const m = parseInt(dob.slice(5,7), 10);
    const d = parseInt(dob.slice(8,10), 10);
    if (!m || !d) return null;
    const ranges = [
      ["Capricorn",  1, 1, 19],
      ["Aquarius",   1, 20, 31], ["Aquarius",   2, 1, 18],
      ["Pisces",     2, 19, 29], ["Pisces",     3, 1, 20],
      ["Aries",      3, 21, 31], ["Aries",      4, 1, 19],
      ["Taurus",     4, 20, 30], ["Taurus",     5, 1, 20],
      ["Gemini",     5, 21, 31], ["Gemini",     6, 1, 20],
      ["Cancer",     6, 21, 30], ["Cancer",     7, 1, 22],
      ["Leo",        7, 23, 31], ["Leo",        8, 1, 22],
      ["Virgo",      8, 23, 31], ["Virgo",      9, 1, 22],
      ["Libra",      9, 23, 30], ["Libra",     10, 1, 22],
      ["Scorpio",   10, 23, 31], ["Scorpio",   11, 1, 21],
      ["Sagittarius",11, 22, 30],["Sagittarius",12, 1, 21],
      ["Capricorn", 12, 22, 31],
    ];
    for (const [sign, mo, lo, hi] of ranges) {
      if (m === mo && d >= lo && d <= hi) return sign;
    }
    return "Capricorn";
  }

  function signOf(profile) {
    if (profile.lagna && SIGNS.includes(profile.lagna)) return profile.lagna;
    return sunSignFromDOB(profile.dob) || "Aries";
  }

  // ---------- Aspect scoring ----------
  // Distance between signs on the wheel: 0..6
  function aspectDistance(a, b) {
    const i = SIGNS.indexOf(a), j = SIGNS.indexOf(b);
    if (i < 0 || j < 0) return 6;
    const d = Math.abs(i - j);
    return Math.min(d, 12 - d); // 0..6
  }

  // Score 0..100 based on aspect quality
  // 0 conjunct ~ 78, 1 semi ~ 60, 2 sextile ~ 88, 3 square ~ 52, 4 trine ~ 96, 5 quincunx ~ 65, 6 opposite ~ 80
  function aspectQuality(a, b) {
    const d = aspectDistance(a, b);
    const map = [78, 60, 88, 52, 96, 65, 80];
    return map[d];
  }
  function aspectName(a, b) {
    const d = aspectDistance(a, b);
    return ["Conjunction","Semi-sextile","Sextile","Square","Trine","Quincunx","Opposition"][d];
  }

  // Element pairing score
  function elementScore(a, b) {
    const ea = ELEMENT[a], eb = ELEMENT[b];
    if (ea === eb) return 92;                                    // same element — easy resonance
    const friendly = (ea === "Fire" && eb === "Air") || (ea === "Air" && eb === "Fire") ||
                     (ea === "Earth" && eb === "Water") || (ea === "Water" && eb === "Earth");
    if (friendly) return 88;
    const challenging = (ea === "Fire" && eb === "Water") || (ea === "Water" && eb === "Fire") ||
                        (ea === "Earth" && eb === "Air") || (ea === "Air" && eb === "Earth");
    if (challenging) return 62;
    return 75;
  }

  // Modality pairing — same modality = friction; complementary = balanced
  function modalityScore(a, b) {
    if (MODALITY[a] === MODALITY[b]) return 64;                  // two cardinals butt heads, etc
    return 82;
  }

  // Polarity — opposite polarities = magnetic, same = comfy but less dynamic
  function polarityScore(a, b) {
    return POLARITY[a] === POLARITY[b] ? 76 : 86;
  }

  // ---------- Time / place resonance ----------
  // Birth hour proximity bonus (closer hour → small bonus, gentle)
  function timeResonance(t1, t2) {
    if (!t1 || !t2) return 78;
    const h1 = parseInt(t1.slice(0,2), 10);
    const h2 = parseInt(t2.slice(0,2), 10);
    if (isNaN(h1) || isNaN(h2)) return 78;
    let diff = Math.abs(h1 - h2);
    if (diff > 12) diff = 24 - diff;
    // 0h diff -> 92, 12h diff -> 70
    return Math.round(92 - (diff / 12) * 22);
  }

  // Place: if both have place strings (any) — small connection bonus
  function placeResonance(p1, p2) {
    if (!p1 && !p2) return 78;
    if (p1 && p2 && p1.trim().toLowerCase() === p2.trim().toLowerCase()) return 90;
    if (p1 || p2) return 80;
    return 78;
  }

  // ---------- Deterministic micro-jitter (kept small) ----------
  function _hash(text) {
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function jitter(seed, range) {
    return (seed % (range * 2 + 1)) - range;
  }

  // ---------- Main ----------
  function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }

  function computeCompatibility(you, partner, intentions = []) {
    const a = signOf(you);
    const b = signOf(partner);

    const aspect = aspectQuality(a, b);
    const elem   = elementScore(a, b);
    const mod    = modalityScore(a, b);
    const pol    = polarityScore(a, b);
    const tRes   = timeResonance(you.time, partner.time);
    const pRes   = placeResonance(you.place, partner.place);

    // Mini-score formulas — each blends the pillars differently
    const seed = _hash(`${you.dob}|${you.time}|${you.place}|${a}::${partner.dob}|${partner.time}|${partner.place}|${b}`);

    const love = clamp(
      0.35 * aspect + 0.25 * elem + 0.15 * pol + 0.10 * tRes + 0.15 * pRes
      + jitter(seed >> 1, 3)
    );
    const trust = clamp(
      0.30 * aspect + 0.30 * mod + 0.20 * elem + 0.10 * pRes + 0.10 * tRes
      + jitter(seed >> 3, 3)
    );
    const communication = clamp(
      0.40 * aspect + 0.20 * pol + 0.20 * (ELEMENT[a] === "Air" || ELEMENT[b] === "Air" ? 92 : 80) +
      0.10 * mod + 0.10 * tRes
      + jitter(seed >> 5, 3)
    );
    const growth = clamp(
      0.25 * aspect + 0.30 * mod + 0.15 * elem + 0.15 * pol + 0.15 * tRes
      + jitter(seed >> 7, 3)
    );
    const energy = clamp(
      0.30 * aspect + 0.25 * elem +
      0.20 * (ELEMENT[a] === "Fire" || ELEMENT[b] === "Fire" ? 92 : 78) +
      0.10 * pol + 0.15 * tRes
      + jitter(seed >> 9, 3)
    );

    // Intention weighting — overall is weighted average tilted toward chosen intentions
    const dimWeights = { Love: 1, Trust: 1, Communication: 1, Growth: 1, Energy: 1 };
    const intentionWeights = {
      Love:       { Love: 2.0, Energy: 1.2, Communication: 1.1 },
      Marriage:   { Trust: 1.8, Love: 1.5, Growth: 1.3 },
      Friendship: { Communication: 1.8, Trust: 1.5, Energy: 1.2 },
      Career:     { Growth: 1.8, Communication: 1.5, Trust: 1.2 },
      Growth:     { Growth: 2.0, Communication: 1.3, Trust: 1.2 },
      Healing:    { Trust: 1.6, Love: 1.4, Growth: 1.4 },
    };
    intentions.forEach((it) => {
      const w = intentionWeights[it];
      if (w) Object.entries(w).forEach(([k, v]) => { dimWeights[k] = Math.max(dimWeights[k], v); });
    });
    const totalW = Object.values(dimWeights).reduce((s, v) => s + v, 0);
    const minis = [
      { label: "Love",          value: love,          weight: dimWeights.Love },
      { label: "Trust",         value: trust,         weight: dimWeights.Trust },
      { label: "Communication", value: communication, weight: dimWeights.Communication },
      { label: "Growth",        value: growth,        weight: dimWeights.Growth },
      { label: "Energy",        value: energy,        weight: dimWeights.Energy },
    ];
    const overall = clamp(
      minis.reduce((s, m) => s + m.value * m.weight, 0) / totalW
    );

    // Strengths / watch-outs vary by sign-pair shape
    const { strengths, watchouts } = narrative(a, b, minis, intentions);

    return {
      overall,
      minis: minis.map(({ label, value }) => ({ label, value })),
      strengths, watchouts,
      chemistry: {
        you:     { sign: a, element: ELEMENT[a], modality: MODALITY[a], polarity: POLARITY[a], glyph: SIGN_GLYPHS[a], si: SIGN_SI[a] },
        partner: { sign: b, element: ELEMENT[b], modality: MODALITY[b], polarity: POLARITY[b], glyph: SIGN_GLYPHS[b], si: SIGN_SI[b] },
        aspect: aspectName(a, b),
        aspectDistance: aspectDistance(a, b),
        pillars: { aspect, element: elem, modality: mod, polarity: pol, time: tRes, place: pRes },
      },
    };
  }

  // ---------- Single-person self-discovery ----------
  function computeSelf(you, intentions = []) {
    const sign = signOf(you);
    const el = ELEMENT[sign];
    const mod = MODALITY[sign];
    const pol = POLARITY[sign];

    const seed = _hash(`self|${you.dob}|${you.time}|${you.place}|${sign}`);
    // Self-pillars (different than couple): grounding, expression, resilience, curiosity, magnetism
    const baseByElement = {
      Fire:  { magnetism: 90, expression: 88, resilience: 78, curiosity: 82, grounding: 70 },
      Earth: { magnetism: 76, expression: 70, resilience: 92, curiosity: 74, grounding: 92 },
      Air:   { magnetism: 82, expression: 90, resilience: 74, curiosity: 92, grounding: 70 },
      Water: { magnetism: 86, expression: 76, resilience: 82, curiosity: 80, grounding: 80 },
    }[el];
    const modAdj = mod === "Cardinal" ? { expression: 4, magnetism: 3 } :
                   mod === "Fixed"    ? { resilience: 6, grounding: 4 } :
                                        { curiosity: 6, expression: 3 };
    const polAdj = pol === "Yang" ? { expression: 2 } : { grounding: 2 };

    const adjusted = {};
    Object.keys(baseByElement).forEach((k) => {
      adjusted[k] = clamp(baseByElement[k] + (modAdj[k] || 0) + (polAdj[k] || 0) + jitter(seed >> (k.length), 3));
    });

    const minis = [
      { label: "Magnetism",   value: adjusted.magnetism },
      { label: "Expression",  value: adjusted.expression },
      { label: "Resilience",  value: adjusted.resilience },
      { label: "Curiosity",   value: adjusted.curiosity },
      { label: "Grounding",   value: adjusted.grounding },
    ];
    const overall = clamp(minis.reduce((s, m) => s + m.value, 0) / minis.length);

    const { strengths, growthAreas } = selfNarrative(sign, intentions);

    return {
      type: "self",
      overall,
      minis,
      strengths,
      watchouts: growthAreas,
      chemistry: {
        you: { sign, element: el, modality: mod, polarity: pol, glyph: SIGN_GLYPHS[sign], si: SIGN_SI[sign] },
      },
    };
  }

  // ---------- Narrative content ----------
  function narrative(a, b, minis, intentions) {
    const d = aspectDistance(a, b);
    const ea = ELEMENT[a], eb = ELEMENT[b];
    const sameElement = ea === eb;
    const aspectStrengths = {
      0: [`As fellow ${a}s you share a quiet, near-telepathic shorthand.`,
          "You move at the same tempo — no one is waiting for the other to catch up."],
      2: [`${a} and ${b} are in easy conversation — sextile aspect makes plans feel light.`,
          "Different enough to learn from each other, similar enough to agree quickly."],
      4: [`Trine between ${a} and ${b} — flow is your natural state together.`,
          "You inspire each other without trying. Joint plans take off on their first push."],
      6: [`${a} and ${b} sit opposite — the attraction is real and the polarity is productive.`,
          "When you align, you cover ground neither could cover alone."],
      1: [`${a}–${b} share a quiet semi-sextile: small, useful nudges in each other's direction.`,
          "Subtle support — the small daily ways you show up matter most."],
      3: [`${a} and ${b} square each other — the friction creates growth.`,
          "Disagreement here is not bad news; it's the engine of your evolution."],
      5: [`${a} and ${b} sit at a quincunx — different blueprints, useful compromises.`,
          "You'll need to translate for each other, but the translation is the point."],
    }[d];

    const elementStrengths = sameElement
      ? `Both ${ea} signs — the same fundamental temperature means you rarely have to explain yourselves.`
      : ({
          "FireAir":   "Fire + Air: ideas catch and spread fast between you.",
          "AirFire":   "Air + Fire: ideas catch and spread fast between you.",
          "EarthWater":"Earth + Water: deeply nourishing — one stabilises, the other softens.",
          "WaterEarth":"Water + Earth: deeply nourishing — one stabilises, the other softens.",
          "FireWater": "Fire + Water can be intense — heat meets depth.",
          "WaterFire": "Water + Fire can be intense — depth meets heat.",
          "EarthAir":  "Earth + Air: practical meets curious — patience required.",
          "AirEarth":  "Air + Earth: curious meets practical — patience required.",
        })[ea + eb];

    const baseStrengths = [
      ...aspectStrengths,
      elementStrengths,
    ];

    const watchouts = {
      0: ["Variety needs to be deliberate — two of the same sign can stagnate.",
          "Don't outsource decisions to 'we already agree' — make sure you actually do."],
      2: ["Light agreement can mask deeper unspoken needs — ask the harder questions.",
          "Don't drift on autopilot just because it's easy."],
      4: ["When everything is flow, complacency is the risk — keep setting fresh edges.",
          "Don't take the harmony for granted; thank each other for it."],
      6: ["Opposition is creative but tiring — schedule cooldowns before the spark frays.",
          "Pick the hill, then descend it together — don't argue every point."],
      1: ["Small mismatches build up; do a weekly check-in.",
          "Speak the unspoken — the smallest unsaid thing becomes the biggest one."],
      3: ["Don't try to 'win' arguments; focus on solving.",
          "Recognise the heat early and step back before it scorches.",
          "The thing you're each defending is usually a value, not a position."],
      5: ["Translate between your different operating systems — assume nothing.",
          "Calendar the awkward conversations; they don't happen by accident."],
    }[d];

    // Add intention-specific watch-outs
    if (intentions.includes("Marriage")) watchouts.push("Discuss timelines explicitly — don't infer them from each other.");
    if (intentions.includes("Career"))   watchouts.push("Decide whose career leads, when — and revisit the answer often.");
    if (intentions.includes("Healing"))  watchouts.push("One of you carries more weight some weeks. Name it, then trade.");

    return {
      strengths: baseStrengths.slice(0, 3),
      watchouts: watchouts.slice(0, 3),
    };
  }

  function selfNarrative(sign, intentions) {
    const el = ELEMENT[sign];
    const mod = MODALITY[sign];
    const strengthsByElement = {
      Fire:  ["You initiate when others hesitate.", "You bring warmth to rooms before you speak.", "Your conviction is contagious."],
      Earth: ["You finish what you start.", "People feel calmer near you.", "Your judgment compounds quietly over years."],
      Air:   ["You see angles others don't.", "You translate complicated feelings into clear words.", "Your curiosity is your gravity."],
      Water: ["You sense the room before it speaks.", "Your loyalty runs underground — deep and quiet.", "You hold space without needing credit for it."],
    }[el];
    const growthByModality = {
      Cardinal: ["Beginning is easy; staying past chapter two is the work.", "Slow down before you announce the next thing.", "Listen for the question already in the room."],
      Fixed:    ["The thing you're protecting may already be safe.", "Distinguish your stance from your identity.", "Change one thing, monthly, on purpose."],
      Mutable:  ["Pick a lane long enough to see what's at the end of it.", "Your adaptability can drift into avoidance.", "Finish before you reinvent."],
    }[mod];

    const extras = [];
    if (intentions.includes("Love"))    extras.push("Let yourself be seen before being understood.");
    if (intentions.includes("Career"))  extras.push("The next move is smaller than you think.");
    if (intentions.includes("Healing")) extras.push("Healing here looks like noticing, not fixing.");

    return {
      strengths: strengthsByElement.slice(0, 3),
      growthAreas: [...growthByModality.slice(0, 2), ...extras].slice(0, 3),
    };
  }

  // Expose
  window.UraniaEngine = {
    SIGNS, SIGN_GLYPHS, SIGN_SI, ELEMENT, MODALITY, POLARITY,
    sunSignFromDOB, signOf,
    aspectDistance, aspectName, aspectQuality,
    computeCompatibility, computeSelf,
  };
})();
