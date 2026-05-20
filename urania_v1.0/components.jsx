/* global React */

// ============================================================
// Urania — Components (final site)
// Cosmic mode by default. All glassmorphism.
// ============================================================

const { useState, useEffect, useMemo, useRef } = React;

// ------------------------------------------------------------
// useCountUp — animated number from 0 → target
// ------------------------------------------------------------
function useCountUp(target, duration = 1400, delay = 200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now() + delay;
    const tick = (now) => {
      if (now < start) { raf = requestAnimationFrame(tick); return; }
      const t = Math.min(1, (now - start) / duration);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setN(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return n;
}

// ------------------------------------------------------------
// Header — wordmark + meta
// ------------------------------------------------------------
function Header({ onLogoClick, screen, onNav }) {
  return (
    <header style={{ borderBottom: "1px solid var(--glass-border)", position: "relative", zIndex: 5, background: "rgba(5,3,16,0.5)", backdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <button onClick={onLogoClick} style={{ background: "none", border: 0, padding: 0, cursor: "pointer", textAlign: "left", color: "inherit" }}>
          <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: "var(--fg-1)" }}>Urania</div>
          <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>Compatibility snapshot · v1</div>
        </button>
        <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <NavBtn active={screen === "welcome"} onClick={() => onNav("welcome")}>Home</NavBtn>
          <NavBtn active={screen === "dashboard"} onClick={() => onNav("dashboard")}>Sessions</NavBtn>
        </nav>
      </div>
    </header>
  );
}
function NavBtn({ active, children, onClick }) {
  return (
    <button onClick={onClick} className="t-fast" style={{
      background: active ? "rgba(255,255,255,0.08)" : "transparent",
      border: 0, padding: "8px 14px", borderRadius: 9999,
      color: active ? "var(--fg-1)" : "var(--fg-3)",
      fontSize: 13, fontWeight: 500, cursor: "pointer",
    }}>{children}</button>
  );
}

// ------------------------------------------------------------
// Footer
// ------------------------------------------------------------
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--glass-border)", padding: "16px 24px", textAlign: "center", fontSize: 12, color: "var(--fg-4)", position: "relative", zIndex: 2, marginTop: 64 }}>
      Urania · Built with FastAPI · Python
    </footer>
  );
}

// ------------------------------------------------------------
// PageHeading
// ------------------------------------------------------------
function PageHeading({ title, subtitle, actions }) {
  return (
    <div className="heading-row" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
      <div>
        <h2 style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.025em", margin: 0, color: "var(--fg-1)" }}>{title}</h2>
        {subtitle && <div style={{ fontSize: 14, color: "var(--fg-3)", marginTop: 6 }}>{subtitle}</div>}
      </div>
      {actions && <div className="actions" style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>{actions}</div>}
    </div>
  );
}

// ------------------------------------------------------------
// Button
// ------------------------------------------------------------
function Button({ variant = "primary", children, onClick, type = "button", size = "md", style = {}, disabled = false }) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const padding = size === "lg" ? "14px 28px" : size === "sm" ? "8px 14px" : "11px 20px";
  const fontSize = size === "lg" ? 15 : 14;

  let bg, color, border;
  if (variant === "primary") {
    bg = disabled ? "rgba(255,255,255,0.18)" : press ? "var(--bg-button-press)" : hover ? "var(--bg-button-hover)" : "var(--bg-button)";
    color = "var(--fg-on-primary)";
    border = "1px solid transparent";
  } else if (variant === "secondary") {
    bg = hover ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)";
    color = "var(--fg-1)";
    border = "1px solid rgba(255,255,255,0.14)";
  } else if (variant === "danger") {
    bg = hover ? "rgba(220,38,38,0.18)" : "rgba(220,38,38,0.10)";
    color = "#fecaca";
    border = "1px solid rgba(220,38,38,0.30)";
  } else {
    bg = hover ? "rgba(255,255,255,0.06)" : "transparent";
    color = "var(--fg-1)";
    border = "1px solid transparent";
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      className="t-fast"
      style={{
        background: bg, color, border, padding,
        borderRadius: "var(--radius-lg)", fontWeight: 600, fontSize,
        cursor: disabled ? "not-allowed" : "pointer", outline: "none",
        backdropFilter: variant === "secondary" ? "blur(10px)" : undefined,
        ...style,
      }}>{children}</button>
  );
}

// ------------------------------------------------------------
// Field / Select — glassy variant
// ------------------------------------------------------------
function Field({ type = "text", name, placeholder, value, onChange, required, ...rest }) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      type={type} name={name} placeholder={placeholder} required={required}
      value={value || ""}
      onChange={onChange}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      className="t-fast"
      style={{
        width: "100%",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${focus ? "rgba(139,92,246,0.55)" : "rgba(255,255,255,0.10)"}`,
        borderRadius: "var(--radius-md)",
        padding: "13px 15px",
        fontSize: 15,
        color: "var(--fg-1)",
        outline: "none",
        backdropFilter: "blur(8px)",
      }}
      {...rest}
    />
  );
}

function Select({ name, value, onChange, children, required }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        name={name} value={value || ""} onChange={onChange} required={required}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        className="t-fast"
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${focus ? "rgba(139,92,246,0.55)" : "rgba(255,255,255,0.10)"}`,
          borderRadius: "var(--radius-md)",
          padding: "13px 38px 13px 15px",
          fontSize: 15,
          color: "var(--fg-1)",
          appearance: "none",
          outline: "none",
          backdropFilter: "blur(8px)",
        }}>{children}</select>
      <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--fg-3)", fontSize: 11 }}>▾</div>
    </div>
  );
}

// ------------------------------------------------------------
// Card — cosmic glass
// ------------------------------------------------------------
function Card({ children, style = {}, padding = 28, radius = 24, iridescent = false, className = "" }) {
  return (
    <div className={`glass-strong ${iridescent ? "iridescent-border glow-cosmic" : ""} ${className}`}
      style={{ borderRadius: radius, padding, position: "relative", ...style }}>
      {children}
    </div>
  );
}

// ------------------------------------------------------------
// ProfileCard — input panel
// ------------------------------------------------------------
const LAGNA_OPTIONS = [
  ["Aries", "මේෂ"], ["Taurus", "වෘෂභ"], ["Gemini", "මිථුන"], ["Cancer", "කටක"],
  ["Leo", "සිංහ"], ["Virgo", "කන්‍යා"], ["Libra", "තුලා"], ["Scorpio", "වෘශ්චික"],
  ["Sagittarius", "ධනු"], ["Capricorn", "මකර"], ["Aquarius", "කුම්භ"], ["Pisces", "මීන"],
];

function ProfileCard({ label, profile, onChange, required = true }) {
  const set = (key) => (e) => onChange({ ...profile, [key]: e.target.value });
  return (
    <Card padding={28} iridescent>
      <h3 style={{ margin: "0 0 4px 0", fontWeight: 600, fontSize: 22, letterSpacing: "-0.015em", color: "var(--fg-1)" }}>{label}</h3>
      <div style={{ fontSize: 13, color: "var(--fg-3)", marginBottom: 22 }}>Birth chart inputs</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FieldLabel label="Date of birth">
          <Field type="date" value={profile.dob} onChange={set("dob")} required={required} />
        </FieldLabel>
        <FieldLabel label="Time of birth">
          <Field type="time" value={profile.time} onChange={set("time")} required={required} />
        </FieldLabel>
        <FieldLabel label="Place of birth" optional>
          <Field type="text" placeholder="City, country" value={profile.place} onChange={set("place")} />
        </FieldLabel>
        <FieldLabel label="Lagna" optional>
          <Select value={profile.lagna} onChange={set("lagna")}>
            <option value="">Choose your Lagna</option>
            {LAGNA_OPTIONS.map(([en, si]) => (
              <option key={en} value={en}>{en} ({si})</option>
            ))}
          </Select>
        </FieldLabel>
      </div>
    </Card>
  );
}

function FieldLabel({ label, optional, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        {optional && <span style={{ color: "var(--fg-4)" }}>optional</span>}
      </div>
      {children}
    </label>
  );
}

// ------------------------------------------------------------
// AnimatedBar — for mini scores
// ------------------------------------------------------------
function AnimatedBar({ value, delay = 0, height = 8 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setW(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return (
    <div style={{ height, borderRadius: 9999, background: "rgba(255,255,255,0.10)", overflow: "hidden" }}>
      <div style={{
        height: "100%",
        width: `${w}%`,
        borderRadius: 9999,
        background: "linear-gradient(90deg, #ffffff 0%, color-mix(in oklab, var(--accent-2) 50%, #ffffff) 100%)",
        transition: "width 900ms var(--ease-out)",
        boxShadow: "0 0 12px rgba(255,255,255,0.18)",
      }} />
    </div>
  );
}

// ------------------------------------------------------------
// MiniScores
// ------------------------------------------------------------
function MiniScores({ minis, columns = 2, animated = true, title = "Mini Scores", subtitle = "Quick breakdown by category" }) {
  return (
    <Card padding={28} iridescent style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 20, color: "var(--fg-1)" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 14, color: "var(--fg-3)", marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: 24, display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 14 }}>
        {minis.map((m, i) => (
          <div key={m.label} style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "var(--radius-lg)",
            padding: "14px 18px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "var(--fg-1)", fontWeight: 500 }}>{m.label}</span>
              <span style={{ color: "var(--fg-2)", fontVariantNumeric: "tabular-nums" }}>{m.value}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <AnimatedBar value={m.value} delay={animated ? 200 + i * 90 : 0} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ------------------------------------------------------------
// ScoreRing — animated, cosmic
// ------------------------------------------------------------
function ScoreRing({ value, size = 220, label = "/ 100", animated = true, suffix = "" }) {
  const displayed = animated ? useCountUp(value, 1500, 250) : value;
  const ringStroke = Math.max(3, Math.round(size * 0.022));
  const inner = size - ringStroke * 2 - 12;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {animated && <div className="ring-pulse" />}
      <div className="ring-cosmic" style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        WebkitMask: `radial-gradient(circle, transparent ${size/2 - ringStroke - 1}px, black ${size/2 - ringStroke}px, black ${size/2 - 1}px, transparent ${size/2}px)`,
                mask: `radial-gradient(circle, transparent ${size/2 - ringStroke - 1}px, black ${size/2 - ringStroke}px, black ${size/2 - 1}px, transparent ${size/2}px)`,
        filter: "drop-shadow(0 0 14px color-mix(in oklab, var(--accent-1) 60%, transparent)) drop-shadow(0 0 28px color-mix(in oklab, var(--accent-2) 40%, transparent))",
      }} />
      <div style={{
        position: "absolute", inset: ringStroke + 6, borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, rgba(10,8,20,0.92), rgba(5,3,16,0.98))",
        display: "grid", placeItems: "center", textAlign: "center",
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: Math.round(size * 0.30), letterSpacing: "-0.03em", color: "var(--fg-1)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {displayed}{suffix}
          </div>
          {label && <div style={{ fontSize: Math.round(size * 0.06), color: "var(--fg-3)", marginTop: 4 }}>{label}</div>}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// HighlightsPanel
// ------------------------------------------------------------
function HighlightsPanel({ title, items, accent = false }) {
  return (
    <Card padding={28} iridescent>
      <div style={{ fontWeight: 600, fontSize: 20, color: "var(--fg-1)" }}>{title}</div>
      <ul style={{ margin: "18px 0 0", padding: 0, listStyle: "none" }}>
        {items.map((s, i) => (
          <li key={i} style={{ display: "flex", gap: 12, marginBottom: 12, color: "var(--fg-2)", fontSize: 15, lineHeight: 1.55 }}>
            <span aria-hidden style={{
              flexShrink: 0, marginTop: 8, width: 6, height: 6, borderRadius: "50%",
              background: accent
                ? "linear-gradient(135deg, var(--accent-1), var(--accent-2))"
                : "rgba(255,255,255,0.55)",
              boxShadow: accent ? "0 0 8px var(--accent-1)" : "none",
            }} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ------------------------------------------------------------
// IntentionChip
// ------------------------------------------------------------
function IntentionChip({ label, glyph, selected, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`chip ${selected ? "selected" : ""}`} style={{
      opacity: disabled && !selected ? 0.4 : 1,
      cursor: disabled && !selected ? "not-allowed" : "pointer",
    }}>
      {glyph && <span style={{ fontSize: 16 }}>{glyph}</span>}
      <span>{label}</span>
    </button>
  );
}

// ------------------------------------------------------------
// SignBadge — sign + element + modality
// ------------------------------------------------------------
function SignBadge({ chemistry, label = "You" }) {
  if (!chemistry) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "var(--radius-lg)",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.12), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.12)",
        display: "grid", placeItems: "center", fontSize: 24, color: "var(--fg-1)",
      }}>{chemistry.glyph}</div>
      <div>
        <div style={{ fontSize: 12, color: "var(--fg-3)" }}>{label}</div>
        <div style={{ fontWeight: 600, color: "var(--fg-1)", fontSize: 16 }}>
          {chemistry.sign} <span style={{ color: "var(--fg-4)", fontWeight: 400, fontSize: 13 }}>({chemistry.si})</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
          {chemistry.element} · {chemistry.modality} · {chemistry.polarity}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Pillar — small kpi chip (for chemistry breakdown)
// ------------------------------------------------------------
function Pillar({ label, value }) {
  return (
    <div style={{
      padding: "14px 16px",
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "var(--radius-md)",
      minWidth: 100,
    }}>
      <div style={{ fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--fg-1)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

// Expose
Object.assign(window, {
  Header, Footer, PageHeading, Button, Field, Select, FieldLabel,
  Card, ProfileCard, MiniScores, ScoreRing, HighlightsPanel,
  IntentionChip, SignBadge, Pillar, AnimatedBar,
  LAGNA_OPTIONS, useCountUp,
});
