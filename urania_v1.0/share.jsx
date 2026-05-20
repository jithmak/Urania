/* global React, Card, Button, PageHeading, ScoreRing, AnimatedBar, MiniScores, HighlightsPanel, SignBadge */

// ============================================================
// Urania — Share screen + Poster + Dashboard
// ============================================================

const SHARE_WRAP = {
  maxWidth: "var(--container-max)",
  margin: "0 auto",
  padding: "40px 32px 64px",
  position: "relative",
  zIndex: 2,
};

// ------------------------------------------------------------
// Poster — 1080 × 1350 shareable
// ------------------------------------------------------------
function Poster({ result, you, partner, isSelf, bgVariant = 0 }) {
  const bgVariants = [
    // Variant 0 — nebula deep
    "radial-gradient(60% 50% at 20% 15%, color-mix(in oklab, var(--accent-1) 55%, transparent), transparent 65%)," +
    "radial-gradient(50% 40% at 85% 80%, color-mix(in oklab, var(--accent-2) 50%, transparent), transparent 65%)," +
    "radial-gradient(45% 38% at 70% 30%, color-mix(in oklab, var(--accent-3) 35%, transparent), transparent 65%)," +
    "radial-gradient(70% 50% at 50% 100%, color-mix(in oklab, var(--accent-1) 30%, transparent), transparent 70%)," +
    "#050310",
    // Variant 1 — calm twilight
    "radial-gradient(70% 60% at 50% 0%, color-mix(in oklab, var(--accent-1) 35%, transparent), transparent 70%)," +
    "radial-gradient(50% 50% at 50% 100%, color-mix(in oklab, var(--accent-2) 30%, transparent), transparent 70%)," +
    "#070418",
    // Variant 2 — magenta wash
    "radial-gradient(80% 60% at 50% 50%, color-mix(in oklab, var(--accent-3) 45%, transparent), transparent 70%)," +
    "radial-gradient(40% 40% at 10% 10%, color-mix(in oklab, var(--accent-4) 30%, transparent), transparent 70%)," +
    "radial-gradient(40% 40% at 90% 90%, color-mix(in oklab, var(--accent-1) 30%, transparent), transparent 70%)," +
    "#0c0518",
    // Variant 3 — cool / minimal
    "radial-gradient(60% 60% at 30% 30%, color-mix(in oklab, var(--accent-2) 22%, transparent), transparent 70%)," +
    "#06040f",
  ];
  const youCh = result.chemistry.you;
  const partnerCh = result.chemistry.partner;

  return (
    <div id="urania-poster" style={{
      width: 1080, height: 1350, borderRadius: 40, padding: 72, position: "relative", overflow: "hidden",
      background: bgVariants[bgVariant % bgVariants.length],
      border: "1px solid rgba(255,255,255,0.12)",
      color: "var(--fg-1)",
      fontFamily: "var(--font-sans)",
    }}>
      {/* Starfield */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage:
          "radial-gradient(1.5px 1.5px at 8% 14%, rgba(255,255,255,0.85) 50%, transparent 51%)," +
          "radial-gradient(1px 1px at 24% 64%, rgba(255,255,255,0.6) 50%, transparent 51%)," +
          "radial-gradient(2px 2px at 41% 22%, rgba(255,255,255,0.75) 50%, transparent 51%)," +
          "radial-gradient(1px 1px at 53% 78%, rgba(255,255,255,0.5) 50%, transparent 51%)," +
          "radial-gradient(1.4px 1.4px at 67% 12%, rgba(255,255,255,0.6) 50%, transparent 51%)," +
          "radial-gradient(1px 1px at 78% 56%, rgba(255,255,255,0.5) 50%, transparent 51%)," +
          "radial-gradient(1px 1px at 88% 84%, rgba(255,255,255,0.6) 50%, transparent 51%)," +
          "radial-gradient(1px 1px at 4% 88%, rgba(255,255,255,0.45) 50%, transparent 51%)," +
          "radial-gradient(1.5px 1.5px at 35% 92%, rgba(255,255,255,0.55) 50%, transparent 51%)," +
          "radial-gradient(1px 1px at 60% 48%, rgba(255,255,255,0.6) 50%, transparent 51%)",
        backgroundSize: "780px 780px",
      }} />

      {/* Top header */}
      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 84, letterSpacing: "-0.03em", lineHeight: 1 }}>Urania</div>
          <div style={{ color: "var(--fg-3)", marginTop: 14, fontSize: 22 }}>
            {isSelf ? "Self-discovery Poster" : "Compatibility Poster"}
          </div>
        </div>
        <div style={{ display: "grid", placeItems: "center" }}>
          <PosterRing value={result.overall} />
        </div>
      </div>

      {/* Sign row */}
      <div style={{ position: "relative", marginTop: 56, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 32 }}>
        <PosterSignBlock chemistry={youCh} label="You" date={you.dob} time={you.time} />
        {!isSelf && (
          <>
            <div style={{
              fontSize: 40, color: "var(--fg-3)",
              background: "linear-gradient(135deg, var(--accent-2), var(--accent-1), var(--accent-3))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{aspectGlyph(result.chemistry.aspectDistance)}</div>
            <PosterSignBlock chemistry={partnerCh} label="Partner" date={partner.dob} time={partner.time} align="right" />
          </>
        )}
      </div>

      {/* Two-column body */}
      <div style={{ position: "relative", marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <div className="glass-strong" style={{ borderRadius: 32, padding: 36 }}>
          <div style={{ fontWeight: 600, fontSize: 28, marginBottom: 24 }}>{isSelf ? "Inner Scores" : "Mini Scores"}</div>
          <div style={{ display: "grid", gap: 16 }}>
            {result.minis.map((m) => (
              <div key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20 }}>
                  <span style={{ color: "var(--fg-1)" }}>{m.label}</span>
                  <span style={{ color: "var(--fg-2)", fontVariantNumeric: "tabular-nums" }}>{m.value}</span>
                </div>
                <div style={{ height: 10, borderRadius: 9999, background: "rgba(255,255,255,0.10)", marginTop: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${m.value}%`, borderRadius: 9999, background: "linear-gradient(90deg, #ffffff 0%, color-mix(in oklab, var(--accent-2) 50%, #ffffff) 100%)", boxShadow: "0 0 12px rgba(255,255,255,0.25)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-strong" style={{ borderRadius: 32, padding: 36 }}>
          <div style={{ fontWeight: 600, fontSize: 28, marginBottom: 24 }}>Highlights</div>
          <div style={{ fontWeight: 600, fontSize: 20, color: "var(--fg-1)" }}>Strengths</div>
          <ul style={{ margin: "12px 0 0", paddingLeft: 24, color: "var(--fg-2)", fontSize: 17, lineHeight: 1.5 }}>
            {result.strengths.map((s, i) => <li key={i} style={{ marginBottom: 10 }}>{s}</li>)}
          </ul>
          <div style={{ fontWeight: 600, fontSize: 20, color: "var(--fg-1)", marginTop: 28 }}>
            {isSelf ? "Growth areas" : "Watch-outs"}
          </div>
          <ul style={{ margin: "12px 0 0", paddingLeft: 24, color: "var(--fg-2)", fontSize: 17, lineHeight: 1.5 }}>
            {result.watchouts.map((w, i) => <li key={i} style={{ marginBottom: 10 }}>{w}</li>)}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 56, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "var(--fg-4)", fontSize: 15 }}>Generated by Urania · Share-ready 1080 × 1350</div>
        <div style={{ fontSize: 30, color: "var(--fg-3)" }}>☾</div>
      </div>
    </div>
  );
}

function PosterRing({ value }) {
  const size = 200;
  const ringStroke = 5;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "conic-gradient(from 200deg at 50% 50%, var(--accent-2) 0deg, var(--accent-1) 110deg, var(--accent-3) 220deg, var(--accent-4) 290deg, var(--accent-2) 360deg)",
        WebkitMask: `radial-gradient(circle, transparent ${size/2 - ringStroke - 1}px, black ${size/2 - ringStroke}px, black ${size/2 - 1}px, transparent ${size/2}px)`,
                mask: `radial-gradient(circle, transparent ${size/2 - ringStroke - 1}px, black ${size/2 - ringStroke}px, black ${size/2 - 1}px, transparent ${size/2}px)`,
        filter: "drop-shadow(0 0 14px color-mix(in oklab, var(--accent-1) 60%, transparent)) drop-shadow(0 0 28px color-mix(in oklab, var(--accent-2) 40%, transparent))",
      }} />
      <div style={{
        position: "absolute", inset: ringStroke + 8, borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, rgba(10,8,20,0.92), rgba(5,3,16,0.98))",
        display: "grid", placeItems: "center", textAlign: "center",
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 64, letterSpacing: "-0.03em", color: "var(--fg-1)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
          <div style={{ fontSize: 14, color: "var(--fg-3)", marginTop: 4 }}>/ 100</div>
        </div>
      </div>
    </div>
  );
}

function PosterSignBlock({ chemistry, label, date, time, align = "left" }) {
  return (
    <div style={{ flex: 1, textAlign: align }}>
      <div style={{ fontSize: 14, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 8, justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
        <div style={{
          fontSize: 56, lineHeight: 1, fontWeight: 300,
          background: "linear-gradient(135deg, var(--accent-2), var(--accent-1), var(--accent-3))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>{chemistry.glyph}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 32, color: "var(--fg-1)", letterSpacing: "-0.02em" }}>{chemistry.sign}</div>
          <div style={{ fontSize: 14, color: "var(--fg-3)" }}>{chemistry.element} · {chemistry.modality}</div>
        </div>
      </div>
      <div style={{ marginTop: 14, fontSize: 14, color: "var(--fg-4)" }}>{date} · {time}</div>
    </div>
  );
}

function aspectGlyph(d) {
  // 0 conj, 2 sextile, 3 sq, 4 trine, 6 opp
  return ["☌","∠","✶","□","△","⚻","☍"][d] || "✦";
}

// ------------------------------------------------------------
// ShareScreen
// ------------------------------------------------------------
function ShareScreen({ you, partner, intentions, result, isSelf, onBack, bgVariant }) {
  const stageRef = React.useRef(null);
  const [scale, setScale] = React.useState(0.55);
  const [downloading, setDownloading] = React.useState(false);

  React.useEffect(() => {
    const compute = () => {
      const w = stageRef.current?.clientWidth || 800;
      const s = Math.min(0.92, Math.max(0.28, (w - 32) / 1080));
      setScale(s);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const download = async () => {
    setDownloading(true);
    try {
      const node = document.getElementById("urania-poster");
      // Temporarily remove the scale wrapper transform during capture? We render the poster at native scale here so html-to-image picks it up correctly.
      const dataUrl = await window.htmlToImage.toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#050310",
      });
      const link = document.createElement("a");
      link.download = `urania-${isSelf ? "self" : "compat"}-${result.overall}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed — check the console.");
    } finally {
      setDownloading(false);
    }
  };

  const copy = async () => {
    try {
      const url = location.href;
      await navigator.clipboard.writeText(url);
      alert("Link copied — it links back to your session in this browser.");
    } catch (e) {
      alert("Could not copy link.");
    }
  };

  return (
    <main style={SHARE_WRAP}>
      <PageHeading
        title="Share / Download"
        subtitle="Poster export · 1080 × 1350 PNG"
        actions={<>
          <Button variant="secondary" onClick={onBack}>Back</Button>
          <Button variant="secondary" onClick={copy}>Copy link</Button>
          <Button variant="primary" onClick={download} disabled={downloading}>
            {downloading ? "Rendering…" : "Download PNG"}
          </Button>
        </>}
      />

      <div ref={stageRef} style={{
        marginTop: 32, overflow: "hidden",
        borderRadius: 24, border: "1px solid var(--glass-border)",
        background: "rgba(255,255,255,0.02)",
        padding: 24, display: "flex", justifyContent: "center",
      }}>
        <div style={{ width: 1080 * scale, height: 1350 * scale, position: "relative" }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 1080, height: 1350, position: "absolute", top: 0, left: 0 }}>
            <Poster result={result} you={you} partner={partner} isSelf={isSelf} bgVariant={bgVariant} />
          </div>
        </div>
      </div>
    </main>
  );
}

// ------------------------------------------------------------
// DashboardScreen — list of saved sessions
// ------------------------------------------------------------
function DashboardScreen({ sessions, onOpen, onDelete, onNew }) {
  return (
    <main style={SHARE_WRAP}>
      <PageHeading
        title="Sessions"
        subtitle={`${sessions.length} saved reading${sessions.length === 1 ? "" : "s"}`}
        actions={<Button variant="primary" onClick={onNew}>New reading</Button>}
      />

      {sessions.length === 0 ? (
        <div className="fade-up" style={{ marginTop: 40 }}>
          <Card padding={48} iridescent style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, lineHeight: 1, opacity: 0.4 }}>☾</div>
            <div style={{ marginTop: 20, fontWeight: 600, fontSize: 22, color: "var(--fg-1)" }}>No sessions yet</div>
            <div style={{ marginTop: 8, color: "var(--fg-3)", fontSize: 15 }}>Generate a reading and tap Save to keep it here.</div>
            <div style={{ marginTop: 28 }}>
              <Button variant="primary" onClick={onNew}>Begin a reading</Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="fade-up" style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="grid-2">
          {sessions.slice().reverse().map((s) => (
            <SessionCard key={s.id} session={s} onOpen={() => onOpen(s.id)} onDelete={() => onDelete(s.id)} />
          ))}
        </div>
      )}

      {sessions.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 16, color: "var(--fg-1)" }}>Aggregate</div>
            <div style={{ fontSize: 13, color: "var(--fg-3)" }}>Across all your saved readings</div>
            <DashboardAggregate sessions={sessions} />
          </Card>
        </div>
      )}
    </main>
  );
}

function SessionCard({ session, onOpen, onDelete }) {
  const [hover, setHover] = React.useState(false);
  const r = session.result;
  const isSelf = session.type === "self";
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="t-base"
      style={{
        padding: 22, borderRadius: 22, position: "relative",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${hover ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.09)"}`,
        backdropFilter: "blur(16px)",
        cursor: "pointer",
      }}
      onClick={onOpen}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "conic-gradient(from 200deg at 50% 50%, var(--accent-2) 0deg, var(--accent-1) 110deg, var(--accent-3) 220deg, var(--accent-4) 290deg, var(--accent-2) 360deg)",
            display: "grid", placeItems: "center",
          }}>
            <div style={{
              width: 54, height: 54, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(10,8,20,0.95), rgba(5,3,16,0.98))",
              display: "grid", placeItems: "center",
            }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--fg-1)", fontVariantNumeric: "tabular-nums" }}>{r.overall}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {isSelf ? "Self-discovery" : "Compatibility"} · {new Date(session.ts).toLocaleDateString()}
            </div>
            <div style={{ fontWeight: 600, fontSize: 17, color: "var(--fg-1)", marginTop: 4 }}>
              {isSelf
                ? `${r.chemistry.you.sign}`
                : `${r.chemistry.you.sign} ${aspectGlyph(r.chemistry.aspectDistance)} ${r.chemistry.partner.sign}`}
            </div>
            <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 4 }}>
              {(session.intentions || []).join(" · ") || "no intentions"}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); if (confirm("Delete this session?")) onDelete(); }}
          className="t-fast"
          aria-label="Delete"
          style={{
            background: "transparent", border: 0, cursor: "pointer",
            color: hover ? "var(--fg-3)" : "var(--fg-4)",
            fontSize: 18, padding: 4, lineHeight: 1,
          }}
        >×</button>
      </div>

      {/* Compact mini scores */}
      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
        {r.minis.map((m) => (
          <div key={m.label} title={`${m.label}: ${m.value}`}>
            <div style={{ fontSize: 10, color: "var(--fg-4)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.label}</div>
            <div style={{ height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.10)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${m.value}%`, background: "linear-gradient(90deg, #ffffff, color-mix(in oklab, var(--accent-2) 50%, #ffffff))" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardAggregate({ sessions }) {
  const stats = React.useMemo(() => {
    const all = sessions.map((s) => s.result.overall);
    const avg = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
    const highest = Math.max(...all);
    const lowest = Math.min(...all);
    const compatCount = sessions.filter((s) => s.type === "compat").length;
    const selfCount = sessions.filter((s) => s.type === "self").length;
    // Most-explored intention
    const counts = {};
    sessions.forEach((s) => (s.intentions || []).forEach((i) => { counts[i] = (counts[i] || 0) + 1; }));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { avg, highest, lowest, compatCount, selfCount, topIntention: top ? top[0] : "—" };
  }, [sessions]);

  return (
    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }} className="grid-3">
      <AggStat label="Average" value={stats.avg} />
      <AggStat label="Highest" value={stats.highest} />
      <AggStat label="Lowest" value={stats.lowest} />
      <AggStat label="Top intention" value={stats.topIntention} />
      <AggStat label="Compat / Self" value={`${stats.compatCount} / ${stats.selfCount}`} />
    </div>
  );
}
function AggStat({ label, value }) {
  return (
    <div style={{
      padding: "16px 18px",
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "var(--radius-md)",
    }}>
      <div style={{ fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--fg-1)", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

Object.assign(window, { Poster, ShareScreen, DashboardScreen, aspectGlyph });
