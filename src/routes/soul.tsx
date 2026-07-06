import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { Heart, Save } from "lucide-react";
import { useEffect, useState } from "react";

const K = "digi.soul.profile";
type SoulProfile = { identity: string; tone: string; mission: string; guardrails: string; brandPrompt: string };
const empty: SoulProfile = { identity: "", tone: "", mission: "", guardrails: "", brandPrompt: "" };

function SoulPage() {
  const [data, setData] = useState<SoulProfile>(empty);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { const raw = localStorage.getItem(K); if (raw) setData({ ...empty, ...JSON.parse(raw) }); } catch {}
  }, []);

  const save = () => {
    localStorage.setItem(K, JSON.stringify(data));
    setSaved(true); setTimeout(() => setSaved(false), 1600);
  };

  const field = (key: keyof SoulProfile, label: string, placeholder: string, rows = 3) => (
    <div>
      <label style={{ display: "block", fontSize: 10.5, letterSpacing: "0.08em", color: "#7A8090", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{label}</label>
      <textarea value={data[key]} onChange={(e) => setData({ ...data, [key]: e.target.value })} placeholder={placeholder} rows={rows}
        style={{ width: "100%", padding: 10, background: "#0A0C12", border: "1px solid #1A1D24", borderRadius: 6, color: "#F5F6F8", fontSize: 12.5, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
    </div>
  );

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #1A1D24", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#EC489918", border: "1px solid #EC489940", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px #EC489920" }}>
            <Heart size={20} color="#EC4899" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "#F5F6F8", margin: 0 }}>Soul</h1>
            <p style={{ fontSize: 12, color: "#7A8090", margin: "3px 0 0" }}>System identity, persona, and operating philosophy.</p>
          </div>
        </div>
        <button onClick={save} style={{ padding: "8px 16px", background: "#EC489920", border: "1px solid #EC489960", borderRadius: 6, color: "#EC4899", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500 }}>
          <Save size={13} /> {saved ? "Saved" : "Save profile"}
        </button>
      </div>
      <div style={{ padding: 24, maxWidth: 760, display: "flex", flexDirection: "column", gap: 16 }}>
        {field("identity", "Identity", "Who is this system? Its role, name, and character.")}
        {field("tone", "Tone", "How should responses feel? Confident, warm, precise, playful...")}
        {field("mission", "Mission", "What is the primary purpose of this operating system?", 4)}
        {field("guardrails", "Guardrails", "What must this system never do? Boundaries and constraints.", 4)}
        {field("brandPrompt", "Brand Prompt", "Full system prompt injected into every agent by default.", 8)}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/soul")({
  head: () => ({ meta: [{ title: "Soul · Digi OS" }] }),
  component: () => <AppShell><SoulPage /></AppShell>,
});
