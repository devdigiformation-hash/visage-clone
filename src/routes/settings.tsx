import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";

const K = "digi.settings";
type Prefs = {
  systemName: string;
  defaultModelId: string;
  temperature: number;
  storagePath: string;
  openrouterKey: string;
  openaiKey: string;
  geminiKey: string;
  deepseekKey: string;
};
const empty: Prefs = { systemName: "Digi Business OS", defaultModelId: "", temperature: 0.7, storagePath: "", openrouterKey: "", openaiKey: "", geminiKey: "", deepseekKey: "" };

function SettingsPage() {
  const [data, setData] = useState<Prefs>(empty);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"general" | "models" | "credentials" | "storage">("general");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { const r = localStorage.getItem(K); if (r) setData({ ...empty, ...JSON.parse(r) }); } catch {}
  }, []);
  const save = () => { localStorage.setItem(K, JSON.stringify(data)); setSaved(true); setTimeout(() => setSaved(false), 1600); };

  const input = (key: keyof Prefs, label: string, placeholder = "", type: string = "text") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10.5, letterSpacing: "0.08em", color: "#7A8090", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{label}</label>
      <input value={data[key] as any} type={type} placeholder={placeholder}
        onChange={(e) => setData({ ...data, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
        style={{ width: "100%", padding: "9px 12px", background: "#0A0C12", border: "1px solid #1A1D24", borderRadius: 6, color: "#F5F6F8", fontSize: 12.5, outline: "none" }} />
    </div>
  );

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #1A1D24", display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#EF444418", border: "1px solid #EF444440", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SettingsIcon size={20} color="#EF4444" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "#F5F6F8", margin: 0 }}>Settings</h1>
            <p style={{ fontSize: 12, color: "#7A8090", margin: "3px 0 0" }}>System configuration, credentials, and defaults.</p>
          </div>
        </div>
        <button onClick={save} style={{ padding: "8px 16px", background: "#EF444420", border: "1px solid #EF444460", borderRadius: 6, color: "#EF4444", cursor: "pointer", fontSize: 12 }}>{saved ? "Saved" : "Save"}</button>
      </div>

      <div style={{ display: "flex", gap: 4, padding: "10px 24px", borderBottom: "1px solid #12151C" }}>
        {(["general", "models", "credentials", "storage"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "6px 14px", fontSize: 11.5, borderRadius: 6, textTransform: "capitalize",
            background: tab === t ? "#1A1D24" : "transparent", border: "1px solid " + (tab === t ? "#2A2D34" : "transparent"),
            color: tab === t ? "#F5F6F8" : "#8A909C", cursor: "pointer",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 640 }}>
        {tab === "general" && <>{input("systemName", "System Name")}</>}
        {tab === "models" && <>{input("defaultModelId", "Default Model ID", "e.g. gpt-5")}{input("temperature", "Temperature", "0.7", "number")}</>}
        {tab === "credentials" && <>
          {input("openaiKey", "OpenAI API Key", "sk-...")}
          {input("geminiKey", "Gemini API Key")}
          {input("deepseekKey", "DeepSeek API Key")}
          {input("openrouterKey", "OpenRouter API Key")}
        </>}
        {tab === "storage" && <>{input("storagePath", "Local Storage Path", "/data/digi")}</>}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Digi OS" }] }),
  component: () => <AppShell><SettingsPage /></AppShell>,
});
