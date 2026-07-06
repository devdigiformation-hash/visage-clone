import { useMemo, useState } from "react";
import { X, Send, Zap, ChevronRight, Sparkles } from "lucide-react";
import {
  buildCapabilityIndex, planDelegation, savePlan, listPlans, executePlan,
  type Plan,
} from "@/lib/orchestrator";

const ACCENT = "#2FE0C8";

export function CommandCenterOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [runLog, setRunLog] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  const idx = useMemo(() => buildCapabilityIndex(), [tick, open]);
  const recent = useMemo(() => listPlans().slice(0, 6), [tick, open]);

  if (!open) return null;

  const submit = () => {
    if (!input.trim()) return;
    const p = planDelegation(input);
    savePlan(p);
    setPlan(p);
    setRunLog([]);
    setTick((t) => t + 1);
  };

  const run = async () => {
    if (!plan) return;
    setRunLog([`▸ Dispatching ${plan.steps.length} step(s)…`]);
    await executePlan(plan, (i, res) => {
      setRunLog((L) => [...L, `[${i + 1}] ${plan.steps[i].refName} — ${res.ok ? "ok" : res.error}`]);
    });
    setRunLog((L) => [...L, "▸ Done."]);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "min(880px, 94vw)", maxHeight: "88vh", overflow: "hidden",
        background: "#0A0C12", border: "1px solid #1A1D24", borderRadius: 14,
        boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 60px ${ACCENT}22`,
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #1A1D24", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={16} color={ACCENT} />
            <div>
              <div style={{ fontSize: 13.5, color: "#F5F6F8", fontWeight: 600 }}>Command Center</div>
              <div style={{ fontSize: 10.5, color: "#7A8090" }}>
                Central orchestrator · aware of {idx.counts.skills} skills · {idx.counts.tools} tools · {idx.counts.agents} agents · {idx.counts.workflows} workflows · {idx.counts.knowledge} knowledge
              </div>
            </div>
          </div>
          <button onClick={onClose} style={iconBtn}><X size={14} /></button>
        </div>

        {/* Awareness strip */}
        <div style={{ padding: "10px 18px", borderBottom: "1px solid #12151C", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(idx.counts).map(([k, v]) => (
            <span key={k} style={pill}>{k}: <b style={{ color: "#F5F6F8", marginLeft: 4 }}>{v}</b></span>
          ))}
        </div>

        {/* Body */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", minHeight: 0, flex: 1 }}>
          {/* Left: input + plan */}
          <div style={{ padding: 16, overflow: "auto" }} className="custom-scroll">
            <div style={{ display: "flex", gap: 8 }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
                placeholder="Speak or type a command…  e.g. “Scan this repo”, “Send WhatsApp reply”, “Run onboarding workflow”"
                rows={2}
                style={{
                  flex: 1, background: "#08090C", border: "1px solid #1A1D24", borderRadius: 8,
                  color: "#F5F6F8", padding: "10px 12px", fontSize: 12.5, outline: "none", resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              <button onClick={submit} style={primaryBtn}><Send size={13} /> Plan</button>
            </div>

            {plan && (
              <div style={{ marginTop: 14, border: "1px solid #1A1D24", borderRadius: 8, background: "#08090C" }}>
                <div style={{ padding: "10px 12px", borderBottom: "1px solid #1A1D24", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11.5, color: "#F5F6F8" }}>
                    Intent: <span style={{ color: ACCENT }}>{plan.intent}</span>
                    <span style={{ marginLeft: 10, color: "#5C616B" }}>confidence {(plan.confidence * 100).toFixed(0)}%</span>
                    {plan.needsApproval && <span style={{ marginLeft: 10, color: "#F5A623" }}>· needs approval</span>}
                  </div>
                  <button onClick={run} style={primaryBtn}><Zap size={12} /> Execute</button>
                </div>
                <div style={{ padding: 8 }}>
                  {plan.steps.length === 0 && <div style={{ fontSize: 11.5, color: "#7A8090", padding: 8 }}>
                    No matching capabilities yet. Add skills/tools/workflows or the assistant will fall back to AI reasoning.
                  </div>}
                  {plan.steps.map((s, i) => (
                    <div key={i} style={stepRow}>
                      <span style={kindBadge(s.kind)}>{s.kind}</span>
                      <ChevronRight size={12} color="#5C616B" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "#F5F6F8" }}>{s.refName}</div>
                        <div style={{ fontSize: 10.5, color: "#7A8090" }}>{s.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {runLog.length > 0 && (
                  <div style={{ borderTop: "1px solid #1A1D24", padding: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8A909C" }}>
                    {runLog.map((l, i) => <div key={i}>{l}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: recent commands */}
          <div style={{ borderLeft: "1px solid #1A1D24", padding: 12, overflow: "auto" }} className="custom-scroll">
            <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#5C616B", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>RECENT</div>
            {recent.length === 0 && <div style={{ fontSize: 11, color: "#5C616B" }}>No commands yet.</div>}
            {recent.map((p) => (
              <button key={p.id} onClick={() => { setInput(p.input); setPlan(p); setRunLog([]); }} style={recentRow}>
                <div style={{ fontSize: 11.5, color: "#F5F6F8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.input}</div>
                <div style={{ fontSize: 10, color: "#7A8090" }}>{p.intent} · {p.steps.length} step(s)</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = { background: "transparent", border: "none", color: "#7A8090", padding: 6, borderRadius: 4, cursor: "pointer" };
const primaryBtn: React.CSSProperties = {
  padding: "8px 14px", fontSize: 12, fontWeight: 600, borderRadius: 6,
  background: `${ACCENT}20`, border: `1px solid ${ACCENT}60`, color: ACCENT, cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
};
const pill: React.CSSProperties = {
  fontSize: 10.5, color: "#8A909C", padding: "3px 8px",
  background: "rgba(255,255,255,0.03)", border: "1px solid #1A1D24", borderRadius: 999,
  fontFamily: "'JetBrains Mono', monospace",
};
const stepRow: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
  borderRadius: 6, marginBottom: 4, background: "rgba(255,255,255,0.02)",
};
const recentRow: React.CSSProperties = {
  display: "block", width: "100%", textAlign: "left", padding: "8px 10px",
  background: "transparent", border: "1px solid #1A1D24", borderRadius: 6,
  color: "#F5F6F8", cursor: "pointer", marginBottom: 6,
};
function kindBadge(kind: string): React.CSSProperties {
  const c = kind === "tool" ? "#7DD3FC" : kind === "workflow" ? "#8B5CF6" : kind === "agent" ? "#A78BFA"
    : kind === "workspace" ? "#F5A623" : kind === "browser" ? "#22C55E" : kind === "channel" ? "#F472B6" : "#F59E0B";
  return {
    fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase",
    padding: "2px 6px", borderRadius: 4, color: c,
    background: `${c}15`, border: `1px solid ${c}40`,
    fontFamily: "'JetBrains Mono', monospace",
  };
}
