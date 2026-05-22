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

  // ---------- Self — Personality paragraph ----------
  const SIGN_PERSONALITY = {
    Aries:       "You move before others have finished thinking — this is a gift, not a flaw. Your instinct is usually right and your energy is the spark that gets rooms moving. The shadow side is impatience with processes that don't match your speed, and a tendency to start more than you finish. Your growth edge is learning that the pause before action isn't weakness — it's precision.",
    Taurus:      "You build things that last. Where others pivot, you hold ground — and the ground usually holds back. Your shadow is resistance dressed as principle: the line between stability and stubbornness is one you'll visit often. The work is learning to distinguish the things worth protecting from the things you're simply used to.",
    Gemini:      "Your mind is the room's best instrument — you pick up signals others miss and translate them fast. You're at your best when ideas are moving, when conversations open doors. The shadow is scattered presence: being everywhere at once means sometimes being nowhere fully. The practice is choosing depth over range, one thing at a time.",
    Cancer:      "You feel the temperature of every room you walk into — this is not imagination, it's data. Your care runs deep and your loyalty is one of the rarest things people encounter. The shadow is absorbing others' emotional weather as if it were your own, and pulling inward when presence is needed most. Your work is learning that your feelings are information, not obligation.",
    Leo:         "You carry a warmth that others turn toward without quite knowing why. Your generosity is real and your vision for what things could be is larger than most people's maps. The shadow is a hunger for recognition that, when unmet, can curdle into performance. The practice is giving from fullness, not from the need to be seen giving.",
    Virgo:       "You see what's actually there — not what people wish were there — and this clarity is quietly invaluable. Your attention to process means things you touch tend to work. The shadow is self-criticism turned outward: the same standard you hold yourself to can make others feel permanently unfinished. Your growth is knowing when good enough is, in fact, enough.",
    Libra:       "You understand the weight of every side of an argument — this is diplomatic genius and personal torment in equal measure. You make spaces feel fairer and conversations feel considered. The shadow is indecision masquerading as balance, and keeping peace at the cost of honesty. Your work is learning that your opinion, stated clearly, doesn't break things — it builds them.",
    Scorpio:     "Your depth of perception is uncommon — you see what people are actually doing, not what they say they are. You love with the kind of intensity that changes people. The shadow is the fortress: an ability to hold a wound indefinitely and a tendency to test before trusting. Your practice is learning that vulnerability isn't exposure — it's connection at its most honest.",
    Sagittarius: "You carry an instinct for meaning that most people spend years looking for. Your enthusiasm is infectious and your range is one of your great assets. The shadow is commitment-aversion dressed as freedom: the escape hatch you've built sometimes trips the exit before the destination is reached. The work is staying past the moment things get complicated.",
    Capricorn:   "You understand that most things worth having are built, not found — and you are exceptionally good at building. Your patience is strategic, your discipline is real, and your track record speaks without needing to be announced. The shadow is the belief that rest is earned rather than necessary, and a tendency to measure worth in output. Your growth is learning that you are not your productivity.",
    Aquarius:    "You see where things are going before the crowd has noticed the direction changed. Your commitment to ideas and ideals is genuine, and your independence is a feature, not a bug. The shadow is emotional distance that reads as detachment: you can be fully committed to humanity while being half-present with the person in front of you. Your work is closing that distance, one conversation at a time.",
    Pisces:      "You live close to the place where feeling and knowing are the same thing. Your empathy is not performance — it's structural, how you're built. The shadow is the dissolution of self in the tides of others: your gift for attunement can blur where you end and the room begins. Your practice is building a container strong enough to hold both your sensitivity and your selfhood.",
  };

  function selfPersonality(sign) {
    return SIGN_PERSONALITY[sign] || SIGN_PERSONALITY.Aries;
  }

  // ---------- Self — Intention sections (sign + modality) ----------
  const SELF_LOVE_BY_MODALITY = {
    Cardinal: "In love, you lead with the question before you've steadied yourself enough to hear the answer. You open the door fast and expect what's on the other side to match the vision you had on the threshold. The lesson is that the people worth keeping are the ones who reshape the vision, not just confirm it. Your openness is your greatest asset — protect it without armoring it.",
    Fixed:    "Your love runs in a straight, deep current — slow to start, slow to shift, completely reliable once it's running. You are the partner who stays, who remembers, who shows up the same way on the hundredth day as the first. The shadow is that the same fixity that makes you loyal can make you immovable when the relationship needs you to bend. The practice is distinguishing commitment from possession.",
    Mutable:  "You love through attunement — matching the other person's frequency, adjusting as they change. This makes you an extraordinary companion in motion. The challenge is maintaining your own thread through all that responsiveness, so the relationship isn't built entirely on your adaptation. Your work in love is knowing what you actually want when no one is asking.",
  };

  const SELF_CAREER_BY_MODALITY = {
    Cardinal: "You are at your best when you're initiating — opening the project, naming the direction, setting the terms. The shadow is restlessness once the initial push is over and someone else carries it through. Your career deepens when you stay past the launch, through the middle part that doesn't feel like invention.",
    Fixed:    "You are the person who delivers — not with fanfare, but with the kind of reliable output that compounds over years into something irreplaceable. The challenge is knowing when to pivot rather than persist, when the thing you've built has reached the limits of its current form. Your career grows when you choose evolution over inertia.",
    Mutable:  "Your range is your edge — you adapt to roles, translate between departments, find the synthesis others miss. The shadow is that visible consistency is what gets you promoted, and adaptability is easy to misread as lack of direction. Your career work is naming your thread clearly so others can follow it, even as you move.",
  };

  const SELF_HEALING_BY_MODALITY = {
    Cardinal: "Healing for you often starts with action — a decision, a move, a new frame. You do well when you can name what you're working on and make a plan. The shadow is moving away from the feeling before you've let it teach you what it came to say. The practice is pausing inside the discomfort long enough to hear it, before the next thing begins.",
    Fixed:    "You process slowly and deeply, and that's not a flaw — it's the way your healing works. What you've been through becomes part of your structure rather than just your story. The shadow is holding the old hurt so long it becomes load-bearing, something the rest of your life builds around. Your work is releasing what was real without losing the lesson it left.",
    Mutable:  "You adapt through healing — you reframe, find the new angle, absorb the lesson and move. This resilience is real. The shadow is resolution that looks like recovery but is actually displacement: the feeling finds a different shape without being fully metabolized. Your healing deepens when you stay with one thing until it's actually done.",
  };

  function selfIntentionSection(sign, intention) {
    const mod = MODALITY[sign];
    if (intention === "Love")    return SELF_LOVE_BY_MODALITY[mod];
    if (intention === "Career")  return SELF_CAREER_BY_MODALITY[mod];
    if (intention === "Healing") return SELF_HEALING_BY_MODALITY[mod];
    return null;
  }

  // ---------- Self — Light reading (sign + polarity → element) ----------
  const SELF_LIGHT_BY_ELEMENT = {
    Fire:  "Something is building quietly that will make more sense by the end of the season. The energy is moving in the right direction — your job is less about pushing and more about pointing. What you start now has a longer reach than it looks.",
    Earth: "The ground you've been preparing is closer to ready than you think. A small consistent action taken now will look, in retrospect, like it changed everything. Let things settle before you judge them.",
    Air:   "A connection or conversation is approaching that will shift the frame you've been working in. The ideas that feel half-formed right now are closer to arrival than they appear. Pay attention to the things you almost said.",
    Water: "Something that has been waiting for permission is ready to move. You're closer to the other side of a feeling than the feeling makes it seem. The next thing doesn't require more understanding — just a small step forward.",
  };

  function selfLightReading(sign) {
    return SELF_LIGHT_BY_ELEMENT[ELEMENT[sign]];
  }

  // ---------- Pair — Dynamic paragraph (aspect + elements) ----------
  const PAIR_DYNAMIC_BY_ASPECT = {
    0: "You are made from the same material — the same tempo, the same instincts, the same fundamental weather. This creates a rare sense of being truly understood, a shorthand that doesn't need to be built from scratch. The dynamic here is one of deep recognition, with the challenge of maintaining enough distinction to keep growing.",
    1: "There is a quiet, useful friction between you — small enough not to chafe, significant enough to keep things honest. You move in slightly different directions, which means you regularly give each other angles the other would have missed. This pairing rewards attentiveness over assumption.",
    2: "There is an easy current between you — ideas pass cleanly, and the adjustments you make for each other feel natural rather than forced. This aspect creates space for real collaboration without the cost of constant translation. The dynamic rewards consistency and a willingness to build together.",
    3: "Your relationship is one of those creative tensions that produces more than comfort alone ever could. The places you disagree are not the problems — they are the engine. You're working in complementary opposition on the same project, and that is a feature, not a flaw.",
    4: "You flow together in a way that rarely requires explanation. The compatibility here is structural — it doesn't depend on circumstance or mood. When things are good, you amplify each other effortlessly; when things are hard, the underlying harmony provides a floor.",
    5: "Your chemistry works through translation — you operate from different blueprints, which means you have to make your thinking visible to each other in ways that other pairs skip. This costs a little, but what it produces is precision and a rare depth of mutual understanding.",
    6: "You are built from opposing poles — and that polarity is genuinely productive when you let it be. What one of you carries naturally, the other has worked to acquire. This is a pairing that expands both people, if you use the tension as information rather than opposition.",
  };

  const PAIR_ELEMENT_SUFFIX = {
    "FireFire":   "Two fire signs bring intensity that multiplies — the risk is burning through things faster than they can replenish, so pace is the practice.",
    "EarthEarth": "Two earth signs bring a shared solidity that most pairs spend years building — the risk is over-caution: protecting what you have rather than growing into what you could have.",
    "AirAir":     "Two air signs generate ideas at a velocity that can outrun execution — the conversation is excellent; the challenge is grounding it into something that lasts.",
    "WaterWater": "Two water signs share a depth of attunement that is genuinely uncommon — the risk is emotional amplification, where the tide runs very high in both directions.",
    "FireAir":    "Fire and air are natural partners — one catches, the other spreads, and your combined energy has real forward momentum.",
    "AirFire":    "Fire and air are natural partners — one catches, the other spreads, and your combined energy has real forward momentum.",
    "EarthWater": "Earth and water are deeply complementary — one provides form, the other nourishment, and together you build things that last.",
    "WaterEarth": "Earth and water are deeply complementary — one provides form, the other nourishment, and together you build things that last.",
    "FireWater":  "Fire and water create steam — intensity and depth meeting in a combination that is rarely neutral, and that calibration is part of the work.",
    "WaterFire":  "Fire and water create steam — intensity and depth meeting in a combination that is rarely neutral, and that calibration is part of the work.",
    "EarthAir":   "Earth and air take patience — one moves in cycles, the other in waves, and when you sync, the collaboration is unusually effective.",
    "AirEarth":   "Earth and air take patience — one moves in cycles, the other in waves, and when you sync, the collaboration is unusually effective.",
  };

  function pairDynamic(a, b) {
    const d = aspectDistance(a, b);
    const ea = ELEMENT[a], eb = ELEMENT[b];
    const base = PAIR_DYNAMIC_BY_ASPECT[d];
    const suffix = PAIR_ELEMENT_SUFFIX[ea + eb] || "";
    return suffix ? `${base} ${suffix}` : base;
  }

  // ---------- Pair — Per-person strengths breakdown ----------
  const SIGN_PAIR_BREAKDOWN = {
    Aries:       { strengths: ["Brings decisive energy and initiative that creates momentum", "Protects and advocates fiercely for what they care about", "Keeps the relationship moving forward through action"],       workOn: ["Learning to pause and hear the full picture before moving", "Staying through the slower chapters with the same energy as the fast ones"] },
    Taurus:      { strengths: ["Provides reliable, grounding presence and consistent follow-through", "Creates a sense of safety and material stability", "Holds commitments with genuine tenacity over the long term"],   workOn: ["Voicing needs early rather than waiting to be read", "Opening to change before it becomes unavoidable"] },
    Gemini:      { strengths: ["Brings curiosity and keeps the intellectual chemistry alive", "Communicates clearly and finds the words when others can't", "Adapts quickly and keeps the dynamic from going stale"],       workOn: ["Staying present in depth rather than moving to the next topic", "Following through on plans with the same energy they start with"] },
    Cancer:      { strengths: ["Nurtures the emotional foundation with genuine care", "Remembers what matters to the other person and acts on it", "Creates a feeling of home wherever they are"],                       workOn: ["Expressing needs directly rather than withdrawing when hurt", "Distinguishing their own emotional weather from the relationship's"] },
    Leo:         { strengths: ["Brings warmth, generosity, and a vision for what things could be", "Makes the other person feel genuinely celebrated", "Creates joyful momentum and holds the relationship with pride"], workOn: ["Receiving as openly as they give", "Staying present when the spotlight isn't on them"] },
    Virgo:       { strengths: ["Attends to the details that make daily life actually work", "Brings practical care that shows up in concrete, meaningful ways", "Helps the relationship run with less friction through thoughtful maintenance"], workOn: ["Extending to themselves the grace they offer to the process", "Distinguishing helpful input from criticism of what isn't broken"] },
    Libra:       { strengths: ["Makes the relationship feel considered and genuinely fair", "Brings aesthetic care and a talent for making shared life feel good", "Holds both perspectives without collapsing either one"],   workOn: ["Stating their own preference before asking what the other wants", "Resolving rather than deferring when something needs resolution"] },
    Scorpio:     { strengths: ["Loves with a depth and intensity that is genuinely transformative", "Holds the other person's complexity without needing to simplify it", "Brings perception that sees past surface to what's actually there"], workOn: ["Opening before fully trusting, rather than testing before opening", "Releasing old wounds rather than using them as evidence in present disputes"] },
    Sagittarius: { strengths: ["Brings meaning, humor, and a sense of expansive possibility", "Keeps the relationship from contracting into routine", "Shares a generosity of spirit that makes the other person feel free"],  workOn: ["Staying through complexity rather than reframing it as an exit cue", "Committing to the present with the same enthusiasm as the next horizon"] },
    Capricorn:   { strengths: ["Brings reliable, long-term investment and steady presence", "Takes the relationship seriously and builds it with care over time", "Creates the kind of security that allows both people to take risks"], workOn: ["Allowing the relationship to be restorative, not just functional", "Expressing warmth and appreciation as consistently as showing up"] },
    Aquarius:    { strengths: ["Brings intellectual depth and genuine interest in who the other person actually is", "Holds the relationship with a freedom that allows both people to grow", "Sees the other person clearly — without idealization, without reduction"], workOn: ["Closing the distance between thinking about the relationship and being in it", "Prioritizing emotional presence over analytical distance in hard moments"] },
    Pisces:      { strengths: ["Brings empathy and attunement that makes the other person feel deeply known", "Holds the relationship with a softness that disarms defensiveness", "Sees the potential in the other person even when they can't see it themselves"], workOn: ["Maintaining their own perspective within the attunement", "Naming their needs clearly rather than hoping they'll be sensed"] },
  };

  function pairPersonBreakdown(sign) {
    return SIGN_PAIR_BREAKDOWN[sign] || SIGN_PAIR_BREAKDOWN.Aries;
  }

  // ---------- Pair — Intention sections ----------
  const PAIR_MARRIAGE_BY_ASPECT = {
    0: { p: "Two of the same sign building a life together have an unusual head start — the shared rhythms, values, and pace create a home that feels natural from early on. The work of marriage here is differentiation: finding your individual edges within a shared world, so the partnership stays dynamic rather than becoming a single note played twice.", insight: "The vow to grow, not just to stay, matters more here than for most." },
    1: { p: "This pairing has the quiet compatibility of two people who were never quite at the same angle but learned to love the slight difference. Marriage here works because neither of you is trying to complete the other — you complement, you don't complete. The life you build will look pleasantly specific to you both.", insight: "The small adjustments you make for each other are not compromise — they're care." },
    2: { p: "A shared life feels relatively natural to build here — the fundamental compatibility means fewer resources spent on translation and more available for actual living. Marriage between a sextile aspect tends to get better over time, the understanding compounding the way investments do when left alone to grow.", insight: "The ease between you is not luck — it's a foundation. Build on it intentionally." },
    3: { p: "Marriage between a square aspect brings the kind of growth that comfort alone doesn't produce. The places where you push each other are not weaknesses in the pairing — they're the parts that build character over decades. A long life together here will be one that both of you are genuinely different for having lived.", insight: "Commit to growing rather than winning, and the tension becomes the best part." },
    4: { p: "This is the aspect that sustains. A trine pairing in marriage has the structural harmony that means the relationship doesn't require constant maintenance to stay healthy — it runs on a deeper frequency that holds through seasons of stress, inattention, and ordinary life. What you build together tends to last.", insight: "The harmony between you is a gift — one worth naming out loud occasionally." },
    5: { p: "Marriage between a quincunx aspect requires the most deliberate communication of any pairing — you don't naturally speak the same language, and that doesn't change with time. What it produces is a relationship where both people have genuinely learned something from each other, in ways that don't happen when everything already fits.", insight: "The translation between you is the relationship. Do it consciously." },
    6: { p: "Opposites in a marriage create a rare kind of wholeness — the life you build together covers more ground than either of you could cover alone. The polarity that creates friction in early stages becomes the thing that makes the long partnership feel complete. You are each other's missing chapter.", insight: "What you most resist in each other is usually the thing you most need to integrate." },
  };

  const PAIR_LOVE_BY_ELEMENT = {
    "FireFire":   { p: "Two fire signs in love create heat that is undeniable — desire, enthusiasm, and a shared intensity that makes early stages feel electric. The challenge over time is that the same combustibility that created the connection needs directing, not extinguishing. The love between you is most alive when it has somewhere to point.",                                                              insight: "Find a shared horizon and move toward it — the relationship thrives when it has a project." },
    "EarthEarth": { p: "Two earth signs in love build something substantial — slowly, carefully, with a sensory depth that tends to deepen the longer it runs. Physical presence, shared routines, and tangible care are the primary love languages here. What this pairing sometimes lacks in passion, it more than makes up for in the kind of comfort that becomes irreplaceable.",                              insight: "The consistency you offer each other is not ordinary — it's the rarest thing in love." },
    "AirAir":     { p: "Two air signs in love fall first for each other's minds, and that intellectual rapport creates a connection that stays interesting. The risk is that the conversation substitutes for the feeling — being in perfect sync mentally without going further into the vulnerability beneath. The love deepens when you let each other be confused.",                                            insight: "Let yourself be not-understood sometimes — it's the fastest route to genuine intimacy." },
    "WaterWater": { p: "Two water signs in love move at the deepest frequency available — feeling each other's states before they're spoken, loving with a totality that is both the beauty and the weight of this connection. The care is to maintain enough individuation that the merging stays chosen, not compelled.",                                                                                       insight: "Love here deepens through honesty, not just closeness — say the thing that's hard to say." },
    "FireAir":    { p: "Fire and air in love have a natural chemistry — the excitement is mutual, the intellectual and energetic compatibility makes early connection feel easy and alive. This pairing tends to be socially vibrant and mutually inspiring. The deeper work is building emotional vocabulary together, since neither element leads with feeling first.",                                          insight: "The connection is real — let it go deeper than enthusiasm." },
    "AirFire":    { p: "Fire and air in love have a natural chemistry — the excitement is mutual, the intellectual and energetic compatibility makes early connection feel easy and alive. This pairing tends to be socially vibrant and mutually inspiring. The deeper work is building emotional vocabulary together, since neither element leads with feeling first.",                                          insight: "The connection is real — let it go deeper than enthusiasm." },
    "EarthWater": { p: "Earth and water in love create a genuinely nourishing pairing — one provides form and stability, the other depth and emotional richness. This combination tends to feel like home: comforting, substantive, capable of weathering real difficulty. The care is that the earth partner doesn't dismiss what the water partner feels as impractical, and vice versa.",                    insight: "Your different languages — feeling and doing — are not opposites. They complete a sentence." },
    "WaterEarth": { p: "Earth and water in love create a genuinely nourishing pairing — one provides form and stability, the other depth and emotional richness. This combination tends to feel like home: comforting, substantive, capable of weathering real difficulty. The care is that the earth partner doesn't dismiss what the water partner feels as impractical, and vice versa.",                    insight: "Your different languages — feeling and doing — are not opposites. They complete a sentence." },
    "FireWater":  { p: "Fire and water in love create a volatile, fascinating pull — the intensity is real on both sides, even if it comes from different sources. Fire brings heat and forward motion; water brings depth and emotional truth. What looks like passion can be turbulence in a thin disguise, and naming the difference early saves considerable energy later.",                              insight: "Name what you need clearly — this pairing requires more translation, not less." },
    "WaterFire":  { p: "Fire and water in love create a volatile, fascinating pull — the intensity is real on both sides, even if it comes from different sources. Fire brings heat and forward motion; water brings depth and emotional truth. What looks like passion can be turbulence in a thin disguise, and naming the difference early saves considerable energy later.",                              insight: "Name what you need clearly — this pairing requires more translation, not less." },
    "EarthAir":   { p: "Earth and air in love takes the most patience of any element pairing — the rhythms are genuinely different. Earth moves in seasons; air moves in waves. What the air partner experiences as stimulating, the earth partner experiences as unsettling. When it works, the combination is unusually complementary, each covering the other's blind spot.",                             insight: "Respect each other's tempo — you're not moving wrong, just differently." },
    "AirEarth":   { p: "Earth and air in love takes the most patience of any element pairing — the rhythms are genuinely different. Earth moves in seasons; air moves in waves. What the air partner experiences as stimulating, the earth partner experiences as unsettling. When it works, the combination is unusually complementary, each covering the other's blind spot.",                             insight: "Respect each other's tempo — you're not moving wrong, just differently." },
  };

  const PAIR_CAREER_BY_MODALITY = {
    "CardinalCardinal": { p: "Two cardinal signs working together are capable of extraordinary initiation — you both naturally lead, both instinctively open doors, and the combined forward energy can be formidable. The challenge is that two people who both want to set direction will need a clear division of domains, or the same initiative that creates momentum will create friction.",                             insight: "Agree on who owns what — then let each other lead in full." },
    "FixedFixed":       { p: "Two fixed signs in a working partnership bring unmatched follow-through — you both stay the course, both resist distraction, both build with a patience that compounds over time. The risk is that the same stability that makes you reliable makes it hard to pivot when the project needs a new direction. Deliberate flexibility is the practice.",                                   insight: "Your consistency is a competitive advantage — build in scheduled reviews to stay responsive." },
    "MutableMutable":   { p: "Two mutable signs working together are extraordinarily adaptable — you respond to change fast, read the room well, and synthesize quickly when conditions shift. The challenge is that adaptability without an anchor can produce motion without direction. Someone needs to hold the thread.",                                                                                           insight: "Appoint a keeper of the through-line — and take turns doing it." },
    "CardinalFixed":    { p: "Cardinal and fixed make a powerful working combination — one opens the door, the other walks through it and finishes. The cardinal energy starts; the fixed energy completes. When you respect each other's role, the collaboration produces more than either would alone. The friction comes when the starter keeps reinventing while the finisher is halfway through the build.",    insight: "Trust the other phase of the work as much as your own." },
    "FixedCardinal":    { p: "Cardinal and fixed make a powerful working combination — one opens the door, the other walks through it and finishes. The cardinal energy starts; the fixed energy completes. When you respect each other's role, the collaboration produces more than either would alone. The friction comes when the starter keeps reinventing while the finisher is halfway through the build.",    insight: "Trust the other phase of the work as much as your own." },
    "CardinalMutable":  { p: "Cardinal and mutable working together have excellent range — the cardinal brings direction, the mutable brings responsive flexibility. You cover the initiation-to-adaptation arc well. The gap is the middle: sustained execution through the unexciting phase tends to fall between you.",                                                                                           insight: "Build in accountability for the unglamorous middle — that's where your gap is." },
    "MutableCardinal":  { p: "Cardinal and mutable working together have excellent range — the cardinal brings direction, the mutable brings responsive flexibility. You cover the initiation-to-adaptation arc well. The gap is the middle: sustained execution through the unexciting phase tends to fall between you.",                                                                                           insight: "Build in accountability for the unglamorous middle — that's where your gap is." },
    "FixedMutable":     { p: "Fixed and mutable working together cover the execution-to-adaptation arc — one holds the course, the other adjusts when the course needs adjusting. This is a genuinely useful combination. The friction comes when the fixed partner reads the mutable's pivots as inconsistency, or the mutable reads the fixed partner's steadiness as inflexibility.",                         insight: "What reads as stubbornness and what reads as flakiness are usually just different time horizons." },
    "MutableFixed":     { p: "Fixed and mutable working together cover the execution-to-adaptation arc — one holds the course, the other adjusts when the course needs adjusting. This is a genuinely useful combination. The friction comes when the fixed partner reads the mutable's pivots as inconsistency, or the mutable reads the fixed partner's steadiness as inflexibility.",                         insight: "What reads as stubbornness and what reads as flakiness are usually just different time horizons." },
  };

  function pairIntentionSection(a, b, intention) {
    const d = aspectDistance(a, b);
    const ea = ELEMENT[a], eb = ELEMENT[b];
    const ma = MODALITY[a], mb = MODALITY[b];
    if (intention === "Marriage") return PAIR_MARRIAGE_BY_ASPECT[d] || PAIR_MARRIAGE_BY_ASPECT[4];
    if (intention === "Love")    return PAIR_LOVE_BY_ELEMENT[ea + eb] || PAIR_LOVE_BY_ELEMENT["FireFire"];
    if (intention === "Career")  return PAIR_CAREER_BY_MODALITY[ma + mb] || PAIR_CAREER_BY_MODALITY["CardinalFixed"];
    return null;
  }

  // ---------- Pair — Light reading (aspect distance) ----------
  const PAIR_LIGHT_BY_ASPECT = {
    0: "You are beginning something that hasn't fully revealed its shape yet — and you don't need it to. What matters is that you're both pointed in the same direction. The rest will clarify as you move.",
    1: "Something small is shifting between you, and the shift is worth paying attention to. The adjustment doesn't need a name yet — let it settle before you analyze it.",
    2: "A period of ease is moving through this connection. You don't need to earn it or explain it — just use it well, together.",
    3: "The tension that's present right now is productive if you let it be. Something useful is being built through the friction — don't smooth it out too quickly.",
    4: "You are in one of the better chapters of this connection. The energy between you is carrying something forward. Notice what's working and say it out loud.",
    5: "There is a translation happening between you that, once it clicks, will open a new register of understanding. You're closer to that click than you think.",
    6: "The polarity between you is doing something — drawing something forward, making something visible. Let the opposition work before you try to resolve it.",
  };

  function pairLightReading(a, b) {
    return PAIR_LIGHT_BY_ASPECT[aspectDistance(a, b)];
  }

  // ---------- Planetary positions ----------
  // Sun + Moon: Meeus "Astronomical Algorithms" Ch.25 / Ch.47 simplified.
  // Mercury–Saturn: deterministic hash spread across the full 360°.
  // Same inputs always produce the same output.

  function _jd(y, m, d, hr) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + hr / 24 + B - 1524.5;
  }

  function _solarLon(y, m, d, hr) {
    const n = _jd(y, m, d, hr) - 2451545.0;
    const L = ((280.460 + 0.9856474 * n) % 360 + 360) % 360;
    const g = ((357.528 + 0.9856003 * n) % 360 + 360) % 360;
    const gr = g * Math.PI / 180;
    return ((L + 1.915 * Math.sin(gr) + 0.020 * Math.sin(2 * gr)) % 360 + 360) % 360;
  }

  function _lunarLon(y, m, d, hr) {
    const T = (_jd(y, m, d, hr) - 2451545.0) / 36525;
    const r = x => ((x % 360 + 360) % 360) * Math.PI / 180;
    const Lm = 218.3164477 + 481267.88123421 * T;
    const Mm = 134.9633964 + 477198.8676313 * T;
    const Ms = 357.5291092 + 35999.0502909 * T;
    const F  = 93.2720950  + 483202.0175233 * T;
    const D  = 297.8501921 + 445267.1114034 * T;
    const lon = Lm
      + 6.288774 * Math.sin(r(Mm))
      + 1.274027 * Math.sin(r(2 * D - Mm))
      + 0.658314 * Math.sin(r(2 * D))
      + 0.213618 * Math.sin(r(2 * Mm))
      - 0.185116 * Math.sin(r(Ms))
      - 0.114332 * Math.sin(r(2 * F))
      + 0.058793 * Math.sin(r(2 * D - 2 * Mm))
      + 0.057066 * Math.sin(r(2 * D - Ms - Mm))
      + 0.053322 * Math.sin(r(2 * D + Mm))
      + 0.045758 * Math.sin(r(2 * D - Ms))
      - 0.040923 * Math.sin(r(Ms - Mm))
      - 0.034720 * Math.sin(r(D))
      - 0.030383 * Math.sin(r(Ms + Mm));
    return ((lon % 360) + 360) % 360;
  }

  function _hashLon(baseSeed, name) {
    return (_hash(baseSeed + "|" + name) % 3600) / 10;
  }

  const PLANET_META = [
    { name: "Sun",     symbol: "☉", color: "#f59e0b" },
    { name: "Moon",    symbol: "☽", color: "#e2e8f0" },
    { name: "Mercury", symbol: "☿", color: "#22d3ee" },
    { name: "Venus",   symbol: "♀", color: "#ec4899" },
    { name: "Mars",    symbol: "♂", color: "#ef4444" },
    { name: "Jupiter", symbol: "♃", color: "#a855f7" },
    { name: "Saturn",  symbol: "♄", color: "#6366f1" },
  ];

  function getPlanetaryPositions(dob, time) {
    if (!dob) return [];
    const [y, m, d] = dob.split("-").map(Number);
    if (!y || !m || !d) return [];
    const hr = time ? parseInt(time.slice(0, 2), 10) + parseInt(time.slice(3, 5), 10) / 60 : 12;
    const seed = String(_hash(dob + "|" + (time || "12:00")));
    const lons = [
      _solarLon(y, m, d, hr),
      _lunarLon(y, m, d, hr),
      _hashLon(seed, "Mercury"),
      _hashLon(seed, "Venus"),
      _hashLon(seed, "Mars"),
      _hashLon(seed, "Jupiter"),
      _hashLon(seed, "Saturn"),
    ];
    return PLANET_META.map((p, i) => {
      const lon = lons[i];
      const signIdx = Math.floor(lon / 30) % 12;
      return {
        name:      p.name,
        symbol:    p.symbol,
        color:     p.color,
        sign:      SIGNS[signIdx],
        degree:    Math.round((lon % 30) * 10) / 10,
        longitude: Math.round(lon * 10) / 10,
      };
    });
  }

  // Expose
  window.UraniaEngine = {
    SIGNS, SIGN_GLYPHS, SIGN_SI, ELEMENT, MODALITY, POLARITY,
    sunSignFromDOB, signOf,
    aspectDistance, aspectName, aspectQuality,
    computeCompatibility, computeSelf,
    selfPersonality, selfIntentionSection, selfLightReading,
    pairDynamic, pairPersonBreakdown, pairIntentionSection, pairLightReading,
    getPlanetaryPositions,
  };
})();
