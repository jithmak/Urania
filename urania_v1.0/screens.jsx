/* global React, Header, Footer, PageHeading, Button, Card, ProfileCard, MiniScores, ScoreRing, HighlightsPanel, IntentionChip, SignBadge, Pillar, AnimatedBar, UraniaEngine */

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
// 1. WelcomeScreen
// ------------------------------------------------------------
function WelcomeScreen({ onStart }) {
  return (
    <main style={{ ...SCREEN_WRAP, paddingTop: 64, paddingBottom: 64 }}>
      <div className="fade-up" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", padding: "6px 14px", borderRadius: 9999, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--fg-3)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 36 }}>
          Compatibility Snapshot · v1
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

        {/* Floating preview ring */}
        <div style={{ marginTop: 80, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            <ScoreRing value={96} size={200} label="/ 100" animated={true} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 80, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="grid-3">
        <FeatureCard glyph="✦" title="Birth chart inputs" body="Date, time, place, and Lagna — enough to derive your sun sign and chart shape." />
        <FeatureCard glyph="◇" title="Set your intentions" body="Pick what you want to learn — love, marriage, friendship, career, growth, or healing." />
        <FeatureCard glyph="☾" title="Share the poster" body="Export a 1080×1350 poster of your reading. Calm aesthetic, no mysticism overload." />
      </div>
    </main>
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
function ResultsScreen({ you, partner, intentions, result, onEdit, onShare, onSave, savedId }) {
  return (
    <main style={SCREEN_WRAP}>
      <PageHeading
        title="Results"
        subtitle={`Compatibility · ${result.chemistry.aspect} · ${intentions.join(" · ") || "no intention set"}`}
        actions={<>
          {!savedId && <Button variant="secondary" onClick={onSave}>Save</Button>}
          {savedId && <span style={{ fontSize: 12, color: "var(--fg-3)", alignSelf: "center", padding: "8px 14px" }}>✓ Saved</span>}
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

      {/* Footer note */}
      <div style={{ marginTop: 32, fontSize: 12, color: "var(--fg-4)", textAlign: "center" }}>
        Input summary: You ({you.dob}, {you.time}) · Partner ({partner.dob}, {partner.time})
      </div>
    </main>
  );
}

// ------------------------------------------------------------
// 6b. SelfResultsScreen
// ------------------------------------------------------------
function SelfResultsScreen({ you, intentions, result, onEdit, onShare, onSave, savedId }) {
  const ch = result.chemistry.you;
  return (
    <main style={SCREEN_WRAP}>
      <PageHeading
        title="Your reading"
        subtitle={`Self-discovery · ${ch.element} · ${ch.modality} · ${intentions.join(" · ") || "no intention set"}`}
        actions={<>
          {!savedId && <Button variant="secondary" onClick={onSave}>Save</Button>}
          {savedId && <span style={{ fontSize: 12, color: "var(--fg-3)", alignSelf: "center", padding: "8px 14px" }}>✓ Saved</span>}
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
                <div style={{
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

      <div style={{ marginTop: 32, fontSize: 12, color: "var(--fg-4)", textAlign: "center" }}>
        Input summary: You ({you.dob}, {you.time}{you.place ? `, ${you.place}` : ""})
      </div>
    </main>
  );
}

Object.assign(window, {
  WelcomeScreen, ConnectionTypeScreen, YourDetailsScreen, PartnerDetailsScreen,
  IntentionsScreen, ResultsScreen, SelfResultsScreen,
  INTENTION_LIST,
});
