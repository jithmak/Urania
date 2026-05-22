/* global React, Header, Footer, PageHeading, Button, Card, ProfileCard, MiniScores, ScoreRing, HighlightsPanel, IntentionChip, SignBadge, Pillar, AnimatedBar, UraniaEngine, BirthChartWheel, CosmicSparkles */

// ============================================================
// Urania — Screens
// ============================================================

const SCREEN_WRAP = {
  maxWidth: "var(--container-max)",
  margin: "0 auto",
  padding: "40px 32px 64px",
  position: "relative",
  zIndex: 2,
};

// ------------------------------------------------------------
// OrbitingPlanets — animated SVG component for WelcomeScreen
// ------------------------------------------------------------
function OrbitingPlanets({ size = 280 }) {
  React.useEffect(() => {
    if (!document.getElementById("urania-orbit-kf")) {
      const s = document.createElement("style");
      s.id = "urania-orbit-kf";
      s.textContent = [
        "@keyframes orbitCW  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }",
        "@keyframes orbitCCW { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }",
        "@keyframes corePulse{ 0%,100%{transform:scale(1);opacity:.75} 50%{transform:scale(1.8);opacity:1} }",
        ".no-ring-spin .urania-orbit-cw,",
        ".no-ring-spin .urania-orbit-ccw { animation-play-state: paused !important; }",
      ].join("\n");
      document.head.appendChild(s);
    }
  }, []);

  const cx = size / 2;       // 140
  const r1 = 90;             // outer orbit radius
  const r2 = 60;             // inner orbit radius
  const orb1 = 14;           // outer orb diameter
  const orb2 = 10;           // inner orb diameter
  const ringStroke = 1;

  // Tail ring dimensions (slightly wider than orbit path)
  const tail1Inner = r1 - orb1 * 0.6;
  const tail1Outer = r1 + orb1 * 0.6;
  const tail2Inner = r2 - orb2 * 0.6;
  const tail2Outer = r2 + orb2 * 0.6;

  // Helper: build a CSS conic-gradient masked to a ring shape
  const tailStyle = (r, innerR, outerR, gradient, duration, direction) => ({
    position: "absolute",
    left: cx - r - outerR + "px",
    top:  cx - r - outerR + "px",
    width:  (r + outerR) * 2 + "px",
    height: (r + outerR) * 2 + "px",
    borderRadius: "50%",
    background: gradient,
    WebkitMask: `radial-gradient(circle, transparent ${innerR}px, black ${innerR + 1}px, black ${outerR - 1}px, transparent ${outerR}px)`,
    mask:        `radial-gradient(circle, transparent ${innerR}px, black ${innerR + 1}px, black ${outerR - 1}px, transparent ${outerR}px)`,
    animation: `${direction} ${duration} linear infinite`,
    pointerEvents: "none",
  });

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>

      {/* ── Orbit path rings (dashed SVG) ── */}
      <svg
        width={size} height={size}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        <circle cx={cx} cy={cx} r={r1}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={ringStroke}
          strokeDasharray="4 8"
        />
        <circle cx={cx} cy={cx} r={r2}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={ringStroke}
          strokeDasharray="4 8"
        />
      </svg>

      {/* ── Outer comet tail (CW, accent-1) ── */}
      <div
        className="urania-orbit-cw"
        style={tailStyle(
          r1, tail1Inner, tail1Outer,
          "conic-gradient(from 90deg, transparent 0deg, transparent 238deg, color-mix(in oklab, var(--accent-1) 4%, transparent) 244deg, color-mix(in oklab, var(--accent-1) 28%, transparent) 292deg, color-mix(in oklab, var(--accent-1) 68%, transparent) 353deg, transparent 360deg)",
          "12s", "orbitCW"
        )}
      />

      {/* ── Inner comet tail (CCW, accent-2) ── */}
      <div
        className="urania-orbit-ccw"
        style={tailStyle(
          r2, tail2Inner, tail2Outer,
          "conic-gradient(from 90deg, color-mix(in oklab, var(--accent-2) 68%, transparent) 0deg, color-mix(in oklab, var(--accent-2) 28%, transparent) 62deg, color-mix(in oklab, var(--accent-2) 5%, transparent) 112deg, transparent 120deg, transparent 360deg)",
          "8s", "orbitCCW"
        )}
      />

      {/* ── Outer orb (accent-1, CW) ── */}
      <div
        className="urania-orbit-cw"
        style={{
          position: "absolute",
          left: cx - r1 - orb1 / 2 + "px",
          top:  cx          - orb1 / 2 + "px",
          width: orb1, height: orb1,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, color-mix(in oklab, var(--accent-1) 90%, white), var(--accent-1))",
          boxShadow: `0 0 ${orb1}px ${orb1 * 0.5}px color-mix(in oklab, var(--accent-1) 60%, transparent),
                      0 0 ${orb1 * 2.5}px ${orb1 * 0.8}px color-mix(in oklab, var(--accent-1) 30%, transparent)`,
          animation: "orbitCW 12s linear infinite",
          transformOrigin: `${r1 + orb1 / 2}px ${orb1 / 2}px`,
        }}
      />

      {/* ── Inner orb (accent-2, CCW) ── */}
      <div
        className="urania-orbit-ccw"
        style={{
          position: "absolute",
          left: cx - r2 - orb2 / 2 + "px",
          top:  cx          - orb2 / 2 + "px",
          width: orb2, height: orb2,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, color-mix(in oklab, var(--accent-2) 90%, white), var(--accent-2))",
          boxShadow: `0 0 ${orb2}px ${orb2 * 0.5}px color-mix(in oklab, var(--accent-2) 60%, transparent),
                      0 0 ${orb2 * 2.5}px ${orb2 * 0.8}px color-mix(in oklab, var(--accent-2) 30%, transparent)`,
          animation: "orbitCCW 8s linear infinite",
          transformOrigin: `${r2 + orb2 / 2}px ${orb2 / 2}px`,
        }}
      />

      {/* ── Central radial glow (accent-3) ── */}
      <div style={{
        position: "absolute",
        left: cx - 28 + "px", top: cx - 28 + "px",
        width: 56, height: 56,
        borderRadius: "50%",
        background: "radial-gradient(circle, color-mix(in oklab, var(--accent-3) 40%, transparent) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Center dot ── */}
      <div
        style={{
          position: "absolute",
          left: cx - 3 + "px", top: cx - 3 + "px",
          width: 6, height: 6,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: `0 0 8px 3px color-mix(in oklab, var(--accent-3) 70%, transparent)`,
          animation: "corePulse 3s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ------------------------------------------------------------
// 1. WelcomeScreen
// ------------------------------------------------------------
function WelcomeScreen({ onStart }) {
  return (
    <>
      {typeof CosmicSparkles === "function" && <CosmicSparkles count={60} />}
      <main style={{ ...SCREEN_WRAP, paddingTop: 64, paddingBottom: 64 }}>
      <div className="fade-up" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", padding: "6px 14px", borderRadius: 9999, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--fg-3)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 36 }}>
          Compatibility Snapshot · v2
        </div>
        <h1 style={{ fontSize: "clamp(48px, 8vw, 88px)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.02, margin: 0, color: "var(--fg-1)" }}>
          A calmer way<br />
          <span style={{
            background: "linear-gradient(135deg, var(--accent-2), var(--accent-1) 40%, var(--accent-3) 80%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>to read the stars.</span>
        </h1>
        <p style={{ color: "var(--fg-3)", fontSize: 18, marginTop: 24, lineHeight: 1.55, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
          Two birth charts, a few intentions, one honest reading. No mysticism — just clean structure and a shareable poster.
        </p>
        <div style={{ marginTop: 48, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="primary" size="lg" onClick={onStart}>Begin a reading</Button>
          <Button variant="secondary" size="lg" onClick={() => location.hash = "#dashboard"}>View past sessions</Button>
        </div>

        {/* Orbiting planets preview */}
        <div style={{ marginTop: 80, display: "flex", justifyContent: "center" }}>
          <OrbitingPlanets size={280} />
        </div>
      </div>

      <div style={{ marginTop: 80, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="grid-3">
        <FeatureCard glyph="✦" title="Birth chart inputs" body="Date, time, place, and Lagna — enough to derive your sun sign and chart shape." />
        <FeatureCard glyph="◇" title="Set your intentions" body="Pick what you want to learn — love, marriage, friendship, career, growth, or healing." />
        <FeatureCard glyph="☾" title="Share the poster" body="Export a 1080×1350 poster of your reading. Calm aesthetic, no mysticism overload." />
      </div>
    </main>
    </>
  );
}

function FeatureCard({ glyph, title, body }) {
  return (
    <div className="glass" style={{ padding: 24, borderRadius: 20 }}>
      <div style={{ fontSize: 28, color: "var(--fg-1)", lineHeight: 1 }}>{glyph}</div>
      <div style={{ fontWeight: 600, fontSize: 16, color: "var(--fg-1)", marginTop: 14 }}>{title}</div>
      <div style={{ fontSize: 14, color: "var(--fg-3)", marginTop: 8, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

// ------------------------------------------------------------
// 2. ConnectionTypeScreen
// ------------------------------------------------------------
function ConnectionTypeScreen({ onPick }) {
  return (
    <main style={SCREEN_WRAP}>
      <PageHeading title="Choose your reading" subtitle="What are you exploring today?" />

      <div className="grid-2 fade-up" style={{ marginTop: 36, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <ConnectionCard
          title="Compatibility"
          subtitle="Two people"
          body="Read the chemistry between you and someone else — partner, friend, collaborator."
          glyph="∞"
          onClick={() => onPick("compat")}
        />
        <ConnectionCard
          title="Self-discovery"
          subtitle="One person"
          body="Just you. A snapshot of your strengths, growth edges, and natural rhythm."
          glyph="◯"
          onClick={() => onPick("self")}
        />
      </div>
    </main>
  );
}

function ConnectionCard({ title, subtitle, body, glyph, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="t-base"
      style={{
        all: "unset", cursor: "pointer", display: "block", textAlign: "left",
        padding: 36, borderRadius: 28, position: "relative",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${hover ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.10)"}`,
        backdropFilter: "blur(20px)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hover
          ? "0 24px 60px -20px color-mix(in oklab, var(--accent-1) 35%, transparent), 0 8px 32px -8px color-mix(in oklab, var(--accent-2) 25%, transparent)"
          : "0 12px 30px -16px rgba(0,0,0,0.4)",
      }}>
      <div style={{
        fontSize: 56, lineHeight: 1, fontWeight: 300,
        background: "linear-gradient(135deg, var(--accent-2), var(--accent-1), var(--accent-3))",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>{glyph}</div>
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 13, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{subtitle}</div>
        <div style={{ fontWeight: 700, fontSize: 32, color: "var(--fg-1)", letterSpacing: "-0.02em", marginTop: 6 }}>{title}</div>
        <div style={{ fontSize: 15, color: "var(--fg-3)", marginTop: 14, lineHeight: 1.55, maxWidth: 320 }}>{body}</div>
      </div>
      <div style={{ marginTop: 32, color: "var(--fg-3)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
        Continue <span aria-hidden>→</span>
      </div>
    </button>
  );
}

// ------------------------------------------------------------
// 3. YourDetailsScreen
// ------------------------------------------------------------
function YourDetailsScreen({ profile, setProfile, onNext, onBack, isSelfFlow }) {
  const valid = profile.dob && profile.time;
  return (
    <main style={SCREEN_WRAP}>
      <PageHeading
        title="Your details"
        subtitle={isSelfFlow ? "Step 1 of 2 · Just your chart" : "Step 1 of 3 · Tell us about you"}
        actions={<Button variant="secondary" onClick={onBack}>Back</Button>}
      />
      <div className="fade-up" style={{ marginTop: 36, maxWidth: 560, margin: "36px auto 0" }}>
        <ProfileCard label="You" profile={profile} onChange={setProfile} />
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" size="lg" onClick={onNext} disabled={!valid}>
            Continue
          </Button>
        </div>
      </div>
    </main>
  );
}

// ------------------------------------------------------------
// 4. PartnerDetailsScreen
// ------------------------------------------------------------
function PartnerDetailsScreen({ profile, setProfile, onNext, onBack }) {
  const valid = profile.dob && profile.time;
  return (
    <main style={SCREEN_WRAP}>
      <PageHeading
        title="Partner details"
        subtitle="Step 2 of 3 · Their birth information"
        actions={<Button variant="secondary" onClick={onBack}>Back</Button>}
      />
      <div className="fade-up" style={{ marginTop: 36, maxWidth: 560, margin: "36px auto 0" }}>
        <ProfileCard label="Partner" profile={profile} onChange={setProfile} />
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" size="lg" onClick={onNext} disabled={!valid}>
            Continue
          </Button>
        </div>
      </div>
    </main>
  );
}

// ------------------------------------------------------------
// 5. IntentionsScreen
// ------------------------------------------------------------
const INTENTION_LIST = [
  { id: "Love",       glyph: "♡" },
  { id: "Marriage",   glyph: "⚭" },
  { id: "Friendship", glyph: "✦" },
  { id: "Career",     glyph: "△" },
  { id: "Growth",     glyph: "✺" },
  { id: "Healing",    glyph: "☾" },
];

function IntentionsScreen({ selected, setSelected, onNext, onBack, isSelfFlow }) {
  const toggle = (id) => {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else if (selected.length < 3) setSelected([...selected, id]);
  };
  return (
    <main style={SCREEN_WRAP}>
      <PageHeading
        title="Set your intentions"
        subtitle={`${isSelfFlow ? "Step 2 of 2" : "Step 3 of 3"} · Pick up to three`}
        actions={<Button variant="secondary" onClick={onBack}>Back</Button>}
      />

      <div className="fade-up" style={{ marginTop: 36, maxWidth: 720, margin: "36px auto 0" }}>
        <Card padding={36} iridescent>
          <div style={{ fontSize: 15, color: "var(--fg-3)", marginBottom: 24 }}>
            Your intentions tilt the reading. The dimensions you care about most are weighted higher in your overall score.
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {INTENTION_LIST.map((it) => (
              <IntentionChip
                key={it.id} label={it.id} glyph={it.glyph}
                selected={selected.includes(it.id)}
                disabled={selected.length >= 3 && !selected.includes(it.id)}
                onClick={() => toggle(it.id)}
              />
            ))}
          </div>

          <div style={{ marginTop: 28, fontSize: 13, color: "var(--fg-4)" }}>
            {selected.length === 0 ? "0 selected · choose at least one to continue" : `${selected.length} selected · ${3 - selected.length} remaining`}
          </div>
        </Card>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" size="lg" onClick={onNext} disabled={selected.length === 0}>
            See results
          </Button>
        </div>
      </div>
    </main>
  );
}

// ------------------------------------------------------------
// 6. ResultsScreen (compatibility)
// ------------------------------------------------------------
function ResultsScreen({ you, partner, intentions, result, onEdit, onShare, onSave, onGoToSessions, savedId }) {
  return (
    <>
      {typeof CosmicSparkles === "function" && <CosmicSparkles count={80} />}
      <main style={SCREEN_WRAP}>
      <PageHeading
        title="Results"
        subtitle={`Compatibility · ${result.chemistry.aspect} · ${intentions.join(" · ") || "no intention set"}`}
        actions={<>
          {!savedId && <Button variant="secondary" onClick={onSave}>Save</Button>}
          {savedId && (
            <button onClick={onGoToSessions} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, alignSelf: "center", padding: "8px 14px" }}>
              <span style={{ fontSize: 12, color: "var(--accent-2)" }}>✓ Saved</span>
              <span style={{ fontSize: 12, color: "var(--fg-4)" }}>· Sessions →</span>
            </button>
          )}
          <Button variant="secondary" onClick={onEdit}>Edit</Button>
          <Button variant="primary" onClick={onShare}>Share / Download</Button>
        </>}
      />

      {/* Hero — overall + ring */}
      <div className="fade-up grid-2" style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24 }}>
        <Card padding={36} iridescent style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <ScoreRing value={result.overall} size={200} label="/ 100" />
          <div>
            <div style={{ fontSize: 13, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall</div>
            <div style={{ fontWeight: 700, fontSize: 72, color: "var(--fg-1)", lineHeight: 1, letterSpacing: "-0.03em", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>{result.overall}</div>
            <div style={{ fontSize: 14, color: "var(--fg-3)", marginTop: 6 }}>out of 100</div>
          </div>
        </Card>

        <Card padding={28} iridescent>
          <div style={{ fontWeight: 600, fontSize: 18, color: "var(--fg-1)" }}>Chemistry</div>
          <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 2 }}>How your charts relate</div>
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="grid-2">
            <SignBadge chemistry={result.chemistry.you} label="You" />
            <SignBadge chemistry={result.chemistry.partner} label="Partner" />
          </div>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Pillar label="Aspect" value={result.chemistry.aspect} />
            <Pillar label="Element" value={result.chemistry.pillars.element} />
            <Pillar label="Modality" value={result.chemistry.pillars.modality} />
            <Pillar label="Polarity" value={result.chemistry.pillars.polarity} />
          </div>
        </Card>
      </div>

      {/* Mini scores */}
      <div className="fade-up" style={{ marginTop: 24, animationDelay: "100ms" }}>
        <MiniScores minis={result.minis} columns={5} />
      </div>

      {/* Highlights */}
      <div className="fade-up grid-2" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, animationDelay: "200ms" }}>
        <HighlightsPanel title="Strengths" items={result.strengths} accent />
        <HighlightsPanel title="Watch-outs" items={result.watchouts} />
      </div>

      {/* Your Dynamic — always visible */}
      <div className="fade-up" style={{ marginTop: 24, animationDelay: "300ms" }}>
        <NarrativeCard
          title="Your Dynamic"
          body={UraniaEngine.pairDynamic(result.chemistry.you.sign, result.chemistry.partner.sign)}
        />
      </div>

      {/* Per-person breakdown */}
      <div className="fade-up" style={{ marginTop: 16, animationDelay: "350ms" }}>
        <PersonBreakdownCard
          youSign={result.chemistry.you.sign}
          partnerSign={result.chemistry.partner.sign}
        />
      </div>

      {/* Intention-gated sections */}
      {(intentions.includes("Marriage") || intentions.includes("Love") || intentions.includes("Career")) && (
        <div className="fade-up" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16, animationDelay: "400ms" }}>
          {intentions.includes("Marriage") && (() => {
            const s = UraniaEngine.pairIntentionSection(result.chemistry.you.sign, result.chemistry.partner.sign, "Marriage");
            return s ? <NarrativeCard title="Marriage Possibility" body={s.p} insight={s.insight} /> : null;
          })()}
          {intentions.includes("Love") && (() => {
            const s = UraniaEngine.pairIntentionSection(result.chemistry.you.sign, result.chemistry.partner.sign, "Love");
            return s ? <NarrativeCard title="Love Compatibility" body={s.p} insight={s.insight} /> : null;
          })()}
          {intentions.includes("Career") && (() => {
            const s = UraniaEngine.pairIntentionSection(result.chemistry.you.sign, result.chemistry.partner.sign, "Career");
            return s ? <NarrativeCard title="Career Dynamic" body={s.p} insight={s.insight} /> : null;
          })()}
        </div>
      )}

      {/* Light Reading — always visible */}
      <div className="fade-up" style={{ marginTop: 16, animationDelay: "450ms" }}>
        <NarrativeCard
          title="Light Reading"
          body={UraniaEngine.pairLightReading(result.chemistry.you.sign, result.chemistry.partner.sign)}
          light
        />
      </div>

      {/* Footer note */}
      <div style={{ marginTop: 32, fontSize: 12, color: "var(--fg-4)", textAlign: "center" }}>
        Input summary: You ({you.dob}, {you.time}) · Partner ({partner.dob}, {partner.time})
      </div>
      </main>
    </>
  );
}

// ------------------------------------------------------------
// 6b. SelfResultsScreen
// ------------------------------------------------------------
function SelfResultsScreen({ you, intentions, result, onEdit, onShare, onSave, onGoToSessions, savedId }) {
  const ch = result.chemistry.you;
  return (
    <>
      {typeof CosmicSparkles === "function" && <CosmicSparkles count={80} />}
      <main style={SCREEN_WRAP}>
      <PageHeading
        title="Your reading"
        subtitle={`Self-discovery · ${ch.element} · ${ch.modality} · ${intentions.join(" · ") || "no intention set"}`}
        actions={<>
          {!savedId && <Button variant="secondary" onClick={onSave}>Save</Button>}
          {savedId && (
            <button onClick={onGoToSessions} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, alignSelf: "center", padding: "8px 14px" }}>
              <span style={{ fontSize: 12, color: "var(--accent-2)" }}>✓ Saved</span>
              <span style={{ fontSize: 12, color: "var(--fg-4)" }}>· Sessions →</span>
            </button>
          )}
          <Button variant="secondary" onClick={onEdit}>Edit</Button>
          <Button variant="primary" onClick={onShare}>Share / Download</Button>
        </>}
      />

      {/* Single-person hero */}
      <div className="fade-up" style={{ marginTop: 32 }}>
        <Card padding={48} iridescent style={{ overflow: "hidden", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 32, alignItems: "center" }} className="grid-2">
            <div>
              <div style={{ fontSize: 13, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Profile · {ch.sign}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 14 }}>
                <div className="glyph-glow" style={{
                  fontSize: 88, lineHeight: 1, fontWeight: 300,
                  background: "linear-gradient(135deg, var(--accent-2), var(--accent-1), var(--accent-3))",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>{ch.glyph}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 48, color: "var(--fg-1)", letterSpacing: "-0.02em", lineHeight: 1 }}>{ch.sign}</div>
                  <div style={{ color: "var(--fg-3)", fontSize: 16, marginTop: 6 }}>{ch.si} · {ch.element} · {ch.modality}</div>
                </div>
              </div>
              <div style={{ marginTop: 28, color: "var(--fg-2)", fontSize: 16, lineHeight: 1.55, maxWidth: 480 }}>
                A {ch.modality.toLowerCase()} {ch.element.toLowerCase()} sign with {ch.polarity.toLowerCase()} polarity — your reading reflects how that shape moves through the world.
              </div>
            </div>
            <div style={{ display: "grid", placeItems: "center" }}>
              <ScoreRing value={result.overall} size={200} label="self" />
            </div>
          </div>
        </Card>
      </div>

      {/* Mini scores */}
      <div className="fade-up" style={{ marginTop: 24, animationDelay: "100ms" }}>
        <MiniScores minis={result.minis} columns={5} title="Inner Scores" subtitle="Your natural strengths by dimension" />
      </div>

      {/* Highlights */}
      <div className="fade-up grid-2" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, animationDelay: "200ms" }}>
        <HighlightsPanel title="Strengths" items={result.strengths} accent />
        <HighlightsPanel title="Growth areas" items={result.watchouts} />
      </div>

      {/* Your Personality — always visible */}
      <div className="fade-up" style={{ marginTop: 24, animationDelay: "300ms" }}>
        <NarrativeCard
          title="Your Personality"
          body={UraniaEngine.selfPersonality(ch.sign)}
        />
      </div>

      {/* Intention-gated sections */}
      {(intentions.includes("Love") || intentions.includes("Career") || intentions.includes("Healing")) && (
        <div className="fade-up" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16, animationDelay: "350ms" }}>
          {intentions.includes("Love") && (
            <NarrativeCard
              title="Love Life"
              body={UraniaEngine.selfIntentionSection(ch.sign, "Love")}
            />
          )}
          {intentions.includes("Career") && (
            <NarrativeCard
              title="Career"
              body={UraniaEngine.selfIntentionSection(ch.sign, "Career")}
            />
          )}
          {intentions.includes("Healing") && (
            <NarrativeCard
              title="Healing"
              body={UraniaEngine.selfIntentionSection(ch.sign, "Healing")}
            />
          )}
        </div>
      )}

      {/* Light Reading — always visible */}
      <div className="fade-up" style={{ marginTop: 16, animationDelay: "400ms" }}>
        <NarrativeCard
          title="Light Reading"
          body={UraniaEngine.selfLightReading(ch.sign)}
          light
        />
      </div>

      <div style={{ marginTop: 32, fontSize: 12, color: "var(--fg-4)", textAlign: "center" }}>
        Input summary: You ({you.dob}, {you.time}{you.place ? `, ${you.place}` : ""})
      </div>
      </main>
    </>
  );
}

// ------------------------------------------------------------
// NarrativeCard — glassmorphism text section
// ------------------------------------------------------------
function NarrativeCard({ title, body, insight, light = false, style = {} }) {
  return (
    <Card padding={28} iridescent style={style}>
      <div style={{ fontSize: 11, color: "var(--fg-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>{title}</div>
      <p style={{ margin: 0, color: light ? "var(--fg-3)" : "var(--fg-2)", fontSize: 15, lineHeight: 1.7, fontStyle: light ? "italic" : "normal" }}>{body}</p>
      {insight && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)", fontSize: 13, color: "var(--fg-3)", lineHeight: 1.55 }}>
          {insight}
        </div>
      )}
    </Card>
  );
}

// ------------------------------------------------------------
// PersonBreakdownCard — two-column strengths/work-on
// ------------------------------------------------------------
function PersonBreakdownCard({ youSign, partnerSign }) {
  const E = UraniaEngine;
  const you = E.pairPersonBreakdown(youSign);
  const partner = E.pairPersonBreakdown(partnerSign);

  const BulletList = ({ items, muted }) => (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {items.map((s, i) => (
        <li key={i} style={{ display: "flex", gap: 10, marginBottom: 10, color: muted ? "var(--fg-3)" : "var(--fg-2)", fontSize: 14, lineHeight: 1.55 }}>
          <span aria-hidden style={{
            flexShrink: 0, marginTop: 7, width: 5, height: 5, borderRadius: "50%",
            background: muted ? "rgba(255,255,255,0.30)" : "linear-gradient(135deg, var(--accent-1), var(--accent-2))",
            boxShadow: muted ? "none" : "0 0 6px var(--accent-1)",
          }} />
          <span>{s}</span>
        </li>
      ))}
    </ul>
  );

  const Column = ({ label, sign, data }) => (
    <div>
      <div style={{ fontSize: 11, color: "var(--fg-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>{label} · {sign}</div>
      <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 8, fontWeight: 500 }}>Strengths</div>
      <BulletList items={data.strengths} />
      <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 14, marginBottom: 8, fontWeight: 500 }}>To work on</div>
      <BulletList items={data.workOn} muted />
    </div>
  );

  return (
    <Card padding={28} iridescent>
      <div style={{ fontSize: 11, color: "var(--fg-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Individual readings</div>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Column label="You" sign={youSign} data={you} />
        <div style={{ borderLeft: "1px solid rgba(255,255,255,0.07)", paddingLeft: 24 }}>
          <Column label="Partner" sign={partnerSign} data={partner} />
        </div>
      </div>
    </Card>
  );
}

Object.assign(window, {
  WelcomeScreen, ConnectionTypeScreen, YourDetailsScreen, PartnerDetailsScreen,
  IntentionsScreen, ResultsScreen, SelfResultsScreen,
  NarrativeCard, PersonBreakdownCard,
  INTENTION_LIST,
});
