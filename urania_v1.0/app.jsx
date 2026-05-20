/* global React, ReactDOM, UraniaEngine,
   Header, Footer,
   WelcomeScreen, ConnectionTypeScreen, YourDetailsScreen, PartnerDetailsScreen, IntentionsScreen,
   ResultsScreen, SelfResultsScreen, ShareScreen, DashboardScreen,
   useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakToggle, TweakRadio, TweakColor, TweakSelect */

// ============================================================
// Urania — App entry + state machine + storage
// ============================================================

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ============================================================
// Tweak defaults (rewritten on disk by the host)
// ============================================================
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "cosmicIntensity": "strong",
  "ringSpin": true,
  "ringSpeed": 8,
  "accent": ["#8b5cf6", "#22d3ee", "#d946ef", "#ec4899"],
  "posterBg": 0
}/*EDITMODE-END*/;

// ============================================================
// Persistence
// ============================================================
const STORAGE_KEY = "urania.sessions.v1";
const DRAFT_KEY = "urania.draft.v1";

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) { return []; }
}
function saveSessions(sessions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch (e) {}
}
function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch (e) { return null; }
}
function saveDraft(d) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch (e) {}
}

// ============================================================
// Routing — hash based
// ============================================================
const SCREENS = ["welcome", "type", "you", "partner", "intentions", "results", "share", "dashboard"];

function getScreenFromHash() {
  const h = (location.hash || "").replace(/^#/, "");
  return SCREENS.includes(h) ? h : "welcome";
}

// ============================================================
// App
// ============================================================
function App() {
  // Tweaks
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweak side effects (CSS variables + body class)
  useEffect(() => {
    const root = document.documentElement;
    const [a1, a2, a3, a4] = t.accent || TWEAK_DEFAULTS.accent;
    root.style.setProperty("--accent-1", a1);
    root.style.setProperty("--accent-2", a2);
    root.style.setProperty("--accent-3", a3);
    root.style.setProperty("--accent-4", a4);

    const strength = t.cosmicIntensity === "off" ? 0 : t.cosmicIntensity === "subtle" ? 0.5 : 1;
    root.style.setProperty("--cosmic-strength", String(strength));
    root.style.setProperty("--ring-speed", `${t.ringSpeed}s`);

    document.body.classList.toggle("no-ring-spin", !t.ringSpin);
  }, [t]);

  // Screen state — read draft synchronously to avoid race conditions
  const initialDraft = useMemo(() => loadDraft() || {}, []);
  const [screen, setScreen] = useState(getScreenFromHash());
  const [flow, setFlow] = useState(initialDraft.flow || "compat");
  const [you, setYou] = useState(initialDraft.you || { dob: "", time: "", place: "", lagna: "" });
  const [partner, setPartner] = useState(initialDraft.partner || { dob: "", time: "", place: "", lagna: "" });
  const [intentions, setIntentions] = useState(Array.isArray(initialDraft.intentions) ? initialDraft.intentions : []);
  const [result, setResult] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [sessions, setSessions] = useState(() => loadSessions());

  // Persist draft
  useEffect(() => {
    saveDraft({ flow, you, partner, intentions });
  }, [flow, you, partner, intentions]);

  // Sync hash <-> screen
  useEffect(() => {
    // Don't let browser restore scroll position on reload
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const onHash = () => setScreen(getScreenFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const goTo = useCallback((s) => {
    location.hash = `#${s}`;
    setScreen(s);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 0);
  }, []);

  // Compute result lazily based on current inputs
  const computedResult = useMemo(() => {
    if (!you.dob || !you.time) return null;
    if (flow === "self") {
      const r = UraniaEngine.computeSelf(you, intentions);
      r.type = "self";
      return r;
    }
    if (!partner.dob || !partner.time) return null;
    const r = UraniaEngine.computeCompatibility(you, partner, intentions);
    r.type = "compat";
    return r;
  }, [flow, you, partner, intentions]);

  const ensureResult = useCallback(() => {
    setResult(computedResult);
    return computedResult;
  }, [computedResult]);

  // Active result: prefer explicitly-stored (from saved session) over live-computed
  const activeResult = result || computedResult;

  // If user lands on a result/share screen with no inputs, redirect to welcome
  useEffect(() => {
    if ((screen === "results" || screen === "share") && !activeResult) {
      goTo("welcome");
    }
  }, [screen, activeResult, goTo]);

  // Save session
  const saveSession = useCallback(() => {
    if (!result) return;
    const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const session = {
      id, ts: Date.now(),
      type: flow,
      you, partner: flow === "compat" ? partner : null,
      intentions, result,
    };
    const next = [...sessions, session];
    setSessions(next);
    saveSessions(next);
    setSavedId(id);
  }, [result, flow, you, partner, intentions, sessions]);

  const deleteSession = useCallback((id) => {
    const next = sessions.filter((s) => s.id !== id);
    setSessions(next);
    saveSessions(next);
  }, [sessions]);

  const openSession = useCallback((id) => {
    const s = sessions.find((x) => x.id === id);
    if (!s) return;
    setFlow(s.type);
    setYou(s.you);
    if (s.partner) setPartner(s.partner); else setPartner({ dob: "", time: "", place: "", lagna: "" });
    setIntentions(s.intentions || []);
    setResult(s.result);
    setSavedId(id);
    goTo("results");
  }, [sessions, goTo]);

  // ============================================================
  // Render screens
  // ============================================================
  let view;
  if (screen === "welcome") {
    view = <WelcomeScreen onStart={() => goTo("type")} />;
  } else if (screen === "type") {
    view = <ConnectionTypeScreen onPick={(t) => { setFlow(t); setResult(null); setSavedId(null); goTo("you"); }} />;
  } else if (screen === "you") {
    view = <YourDetailsScreen
      profile={you} setProfile={setYou}
      isSelfFlow={flow === "self"}
      onBack={() => goTo("type")}
      onNext={() => goTo(flow === "self" ? "intentions" : "partner")}
    />;
  } else if (screen === "partner") {
    view = <PartnerDetailsScreen
      profile={partner} setProfile={setPartner}
      onBack={() => goTo("you")}
      onNext={() => goTo("intentions")}
    />;
  } else if (screen === "intentions") {
    view = <IntentionsScreen
      selected={intentions} setSelected={setIntentions}
      isSelfFlow={flow === "self"}
      onBack={() => goTo(flow === "self" ? "you" : "partner")}
      onNext={() => { setSavedId(null); setResult(null); goTo("results"); }}
    />;
  } else if (screen === "results") {
    const r = activeResult;
    if (!r) { view = null; }
    else if (flow === "self") {
      view = <SelfResultsScreen
        you={you} intentions={intentions} result={r}
        savedId={savedId}
        onEdit={() => goTo("you")}
        onShare={() => goTo("share")}
        onSave={saveSession}
      />;
    } else {
      view = <ResultsScreen
        you={you} partner={partner} intentions={intentions} result={r}
        savedId={savedId}
        onEdit={() => goTo("you")}
        onShare={() => goTo("share")}
        onSave={saveSession}
      />;
    }
  } else if (screen === "share") {
    const r = activeResult;
    if (!r) { view = null; }
    else {
      view = <ShareScreen
        you={you} partner={partner} intentions={intentions}
        result={r} isSelf={flow === "self"}
        bgVariant={t.posterBg || 0}
        onBack={() => goTo("results")}
      />;
    }
  } else if (screen === "dashboard") {
    view = <DashboardScreen
      sessions={sessions}
      onOpen={openSession}
      onDelete={deleteSession}
      onNew={() => { setResult(null); setSavedId(null); goTo("type"); }}
    />;
  }

  return (
    <div className="app-shell">
      <div className="cosmic-bg" />
      <div className="nebula-streak" />
      <Header
        screen={screen}
        onLogoClick={() => goTo("welcome")}
        onNav={goTo}
      />
      {view}
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Cosmic" />
        <TweakRadio label="Intensity" value={t.cosmicIntensity}
          options={["off", "subtle", "strong"]}
          onChange={(v) => setTweak("cosmicIntensity", v)} />
        <TweakSection label="Ring" />
        <TweakToggle label="Animate" value={t.ringSpin}
          onChange={(v) => setTweak("ringSpin", v)} />
        <TweakSlider label="Spin duration" value={t.ringSpeed}
          min={2} max={30} step={1} unit="s"
          onChange={(v) => setTweak("ringSpeed", v)} />
        <TweakSection label="Accent palette" />
        <TweakColor label="Palette" value={t.accent}
          options={[
            ["#8b5cf6", "#22d3ee", "#d946ef", "#ec4899"],  // Cosmic (default)
            ["#6366f1", "#06b6d4", "#a855f7", "#f0abfc"],  // Aurora
            ["#ef4444", "#f59e0b", "#ec4899", "#fb7185"],  // Solar
            ["#10b981", "#06b6d4", "#3b82f6", "#a78bfa"],  // Oceanic
            ["#a855f7", "#ec4899", "#f43f5e", "#fb923c"],  // Magenta
          ]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Poster" />
        <TweakSelect label="Background" value={String(t.posterBg)}
          options={[
            { value: "0", label: "Nebula (default)" },
            { value: "1", label: "Twilight" },
            { value: "2", label: "Magenta wash" },
            { value: "3", label: "Cool minimal" },
          ]}
          onChange={(v) => setTweak("posterBg", parseInt(v, 10))} />
      </TweaksPanel>
    </div>
  );
}

// Insert global style for the no-spin override
const noSpinStyle = document.createElement("style");
noSpinStyle.textContent = `.no-ring-spin .ring-cosmic { animation: none !important; }`;
document.head.appendChild(noSpinStyle);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
