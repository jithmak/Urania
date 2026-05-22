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
          <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>Compatibility snapshot · v2</div>
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

// ------------------------------------------------------------
// BirthChartWheel — pure SVG, bg or full mode
// ------------------------------------------------------------
const _WHEEL_SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const _WHEEL_GLYPHS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

function BirthChartWheel({ mode = "bg", planets = [], sunSign = "", lagna = "", opacity = 0.10, size = 600, animDuration = 90 }) {
  const cx = size / 2, cy = size / 2;
  const Ro = size * 0.47;  // outer rim
  const Rl = size * 0.41;  // glyph label ring
  const Rh = size * 0.36;  // house inner edge
  const Rp = size * 0.28;  // planet ring
  const Ri = size * 0.20;  // inner circle

  React.useEffect(() => {
    if (!document.getElementById('urania-wheel-kf')) {
      const s = document.createElement('style');
      s.id = 'urania-wheel-kf';
      s.textContent = '@keyframes uraniaWheelSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }
  }, []);

  const pt = (r, deg) => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const sector = (r1, r2, a1, a2) => {
    const p1 = pt(r1, a1), p2 = pt(r1, a2);
    const q1 = pt(r2, a1), q2 = pt(r2, a2);
    const lg = (a2 - a1) > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r1} ${r1} 0 ${lg} 1 ${p2.x} ${p2.y} L ${q2.x} ${q2.y} A ${r2} ${r2} 0 ${lg} 0 ${q1.x} ${q1.y} Z`;
  };

  const sunIdx = _WHEEL_SIGNS.indexOf(sunSign);
  const lagnaIdx = _WHEEL_SIGNS.indexOf(lagna);

  if (mode === "bg") {
    const Rm1 = size * 0.42;  // glyph band outer edge
    const Rm2 = size * 0.37;  // glyph band inner edge
    return (
      <div style={{ width: size, height: size, animation: `uraniaWheelSpin ${animDuration}s linear infinite`, transformOrigin: "center center" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity, display: "block" }}>
          {/* Concentric rings */}
          <circle cx={cx} cy={cy} r={Ro}  fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={Rm1} fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth={0.8} />
          <circle cx={cx} cy={cy} r={Rm2} fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth={0.8} />
          <circle cx={cx} cy={cy} r={Rp}  fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={0.8} />
          <circle cx={cx} cy={cy} r={Ri}  fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth={1} />
          {/* Minor 10° ticks on outer rim */}
          {Array.from({ length: 36 }, (_, i) => {
            if (i % 3 === 0) return null;
            const p1 = pt(Ro - size * 0.025, i * 10), p2 = pt(Ro, i * 10);
            return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.12)" strokeWidth={0.5} />;
          })}
          {/* Major 30° spokes */}
          {_WHEEL_SIGNS.map((_, i) => {
            const p1 = pt(Ri, i * 30), p2 = pt(Ro, i * 30);
            return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.18)" strokeWidth={0.8} />;
          })}
          {/* Zodiac glyphs in the outer glyph band */}
          {_WHEEL_GLYPHS.map((glyph, i) => {
            const pos = pt((Rm1 + Ro) / 2, i * 30 + 15);
            return (
              <text key={i} x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.032} fill="rgba(255,255,255,0.50)"
              >{glyph}</text>
            );
          })}
          {/* Planet dots */}
          {planets.map((p, i) => {
            const pos = pt(Rp, p.longitude || 0);
            return <circle key={i} cx={pos.x} cy={pos.y} r={Math.max(2.5, size * 0.010)} fill={p.color} opacity={0.70} />;
          })}
          {/* Center dot */}
          <circle cx={cx} cy={cy} r={size * 0.012} fill="rgba(255,255,255,0.25)" />
        </svg>
      </div>
    );
  }

  // full mode
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <defs>
        <filter id="bcw-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {_WHEEL_SIGNS.map((_, i) => {
        const isSun = sunIdx >= 0 && i === sunIdx;
        const isLagna = lagnaIdx >= 0 && i === lagnaIdx;
        const fill = isSun
          ? "rgba(139,92,246,0.18)"
          : isLagna
          ? "rgba(34,211,238,0.14)"
          : "rgba(255,255,255,0.025)";
        return (
          <path key={i} d={sector(Ro, Rh, i * 30, (i + 1) * 30)}
            fill={fill} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        );
      })}
      <circle cx={cx} cy={cy} r={Ro} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={Rh} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={Rp} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
      <circle cx={cx} cy={cy} r={Ri} fill="rgba(5,3,16,0.55)" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      {_WHEEL_SIGNS.map((_, i) => {
        const p1 = pt(Rh, i * 30), p2 = pt(Ro, i * 30);
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />;
      })}
      {_WHEEL_GLYPHS.map((glyph, i) => {
        const pos = pt(Rl, i * 30 + 15);
        const isSun = sunIdx >= 0 && i === sunIdx;
        const isLagna = lagnaIdx >= 0 && i === lagnaIdx;
        return (
          <text key={i} x={pos.x} y={pos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.038}
            fill={isSun ? "var(--accent-1)" : isLagna ? "var(--accent-2)" : "rgba(255,255,255,0.50)"}
            filter={(isSun || isLagna) ? "url(#bcw-glow)" : undefined}
          >{glyph}</text>
        );
      })}
      {planets.map((p, i) => {
        const pos = pt(Rp, p.longitude || 0);
        return (
          <text key={i} x={pos.x} y={pos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.030}
            fill={p.color}
            filter="url(#bcw-glow)"
          >{p.symbol}</text>
        );
      })}
      {sunIdx >= 0 && (
        <text x={cx} y={cy}
          textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.07} fill="rgba(255,255,255,0.45)"
        >{_WHEEL_GLYPHS[sunIdx]}</text>
      )}
    </svg>
  );
}

// ------------------------------------------------------------
// CosmicSparkles — scattered twinkling star field
// ------------------------------------------------------------
function CosmicSparkles({ count = 80, zIndex = 1 }) {
  React.useEffect(() => {
    if (!document.getElementById('urania-sparkle-kf')) {
      const s = document.createElement('style');
      s.id = 'urania-sparkle-kf';
      s.textContent = '@keyframes uraniaTwinkle{0%,100%{opacity:.04;transform:scale(.6)}50%{opacity:1;transform:scale(1.15)}}';
      document.head.appendChild(s);
    }
  }, []);

  const stars = React.useMemo(() => {
    const rng = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const bright = Math.floor(count * 0.06);
    const medium = Math.floor(count * 0.25);
    return Array.from({ length: count }, (_, i) => ({
      x: rng(i * 3)  * 100,
      y: rng(i * 7)  * 100,
      size: i < bright ? 2.5 + rng(i * 11) * 1.5
           : i < medium ? 1.5 + rng(i * 5) * 0.8
           :               0.5 + rng(i * 2) * 0.8,
      dur:   1.5 + rng(i * 13) * 5,
      delay: rng(i * 17) * 8,
      glow:  i < bright,
    }));
  }, [count]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex, pointerEvents: "none", overflow: "hidden" }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: "absolute",
          left:  `${s.x}%`,
          top:   `${s.y}%`,
          width:  s.size,
          height: s.size,
          borderRadius: "50%",
          background: "#fff",
          animation: `uraniaTwinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          boxShadow: s.glow ? `0 0 ${s.size * 4}px ${s.size * 0.7}px rgba(160,130,255,.5)` : "none",
          willChange: "opacity, transform",
        }} />
      ))}
    </div>
  );
}

// Expose
Object.assign(window, {
  Header, Footer, PageHeading, Button, Field, Select, FieldLabel,
  Card, ProfileCard, MiniScores, ScoreRing, HighlightsPanel,
  IntentionChip, SignBadge, Pillar, AnimatedBar,
  BirthChartWheel, CosmicSparkles,
  LAGNA_OPTIONS, useCountUp,
});
