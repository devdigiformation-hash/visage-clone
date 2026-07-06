import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { Activity } from "lucide-react";
import { useMemo, useState } from "react";

type Entry = { ts: number; level: "info" | "warn" | "error" | "debug"; source: string; message: string };

function seed(): Entry[] {
  const now = Date.now();
  const src = ["agent:sales", "workflow:onboard", "tool:web-search", "model:gpt-5", "channel:whatsapp", "system", "memory:index"];
  const msgs = [
    ["info", "Agent run completed in 4.2s"],
    ["info", "Workflow step 2/5 executed"],
    ["warn", "Rate limit approaching (58/60)"],
    ["error", "Tool timeout after 30s — retrying"],
    ["info", "Model call 1,240 tokens"],
    ["debug", "Trace attached to run r_1a92"],
    ["info", "Memory reindex completed (312 items)"],
    ["info", "Channel inbound message received"],
    ["warn", "Fallback model triggered"],
  ] as const;
  return Array.from({ length: 40 }).map((_, i) => {
    const [level, message] = msgs[i % msgs.length];
    return { ts: now - i * 60_000 - Math.random() * 30_000, level: level as Entry["level"], source: src[i % src.length], message };
  });
}

function LogsPage() {
  const [entries] = useState<Entry[]>(seed);
  const [level, setLevel] = useState<string>("all");
  const [q, setQ] = useState("");
  const rows = useMemo(() => entries
    .filter(e => level === "all" || e.level === level)
    .filter(e => !q || e.source.includes(q) || e.message.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.ts - a.ts), [entries, level, q]);
  const color = (l: string) => l === "error" ? "#EF4444" : l === "warn" ? "#F59E0B" : l === "debug" ? "#94A3B8" : "#2FE0C8";

  return (
    <div style={{ flex: 1, overflow: "auto" }} className="custom-scroll">
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #1A1D24", display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: "#2FE0C818", border: "1px solid #2FE0C840", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Activity size={20} color="#2FE0C8" />
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#F5F6F8", margin: 0 }}>Activity & Traces</h1>
          <p style={{ fontSize: 12, color: "#7A8090", margin: "3px 0 0" }}>Agent runs, workflow executions, tool calls, model usage, system events.</p>
        </div>
      </div>
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #12151C", display: "flex", gap: 10, alignItems: "center" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search source or message…"
          style={{ flex: 1, maxWidth: 360, padding: "8px 12px", background: "#0A0C12", border: "1px solid #1A1D24", borderRadius: 6, color: "#F5F6F8", fontSize: 12.5, outline: "none" }} />
        {["all", "error", "warn", "info", "debug"].map(l => (
          <button key={l} onClick={() => setLevel(l)} style={{
            padding: "6px 12px", fontSize: 11, borderRadius: 6, textTransform: "uppercase",
            background: level === l ? "#1A1D24" : "transparent", border: `1px solid ${level === l ? "#2A2D34" : "transparent"}`,
            color: level === l ? "#F5F6F8" : "#8A909C", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
          }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
        {rows.map((e, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 60px 160px 1fr", gap: 12, padding: "6px 8px", borderBottom: "1px solid #12151C" }}>
            <span style={{ color: "#5C616B" }}>{new Date(e.ts).toISOString().replace("T", " ").slice(0, 19)}</span>
            <span style={{ color: color(e.level), textTransform: "uppercase" }}>{e.level}</span>
            <span style={{ color: "#A78BFA" }}>{e.source}</span>
            <span style={{ color: "#C4C8D0" }}>{e.message}</span>
          </div>
        ))}
        {rows.length === 0 && <div style={{ padding: 24, color: "#5C616B", textAlign: "center" }}>No matching entries.</div>}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/logs")({
  head: () => ({ meta: [{ title: "Logs · Digi OS" }] }),
  component: () => <AppShell><LogsPage /></AppShell>,
});
