import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { Command, ArrowUp } from "lucide-react";
import { useState } from "react";

const QUICK = [
  { label: "Start all agents", cmd: "start agents" },
  { label: "Run daily report", cmd: "run report daily" },
  { label: "Sync integrations", cmd: "sync integrations" },
  { label: "Show pending jobs", cmd: "jobs pending" },
  { label: "Health check", cmd: "system health" },
  { label: "Reload workflows", cmd: "workflows reload" },
];

function CommandPage() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<{ ts: string; cmd: string; result: string }[]>([]);

  const run = (cmd: string) => {
    if (!cmd.trim()) return;
    const ts = new Date().toLocaleTimeString();
    setLog((prev) => [{ ts, cmd, result: `Queued: ${cmd}` }, ...prev].slice(0, 40));
    setInput("");
  };

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #1A1D24", display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: "#2FE0C818", border: "1px solid #2FE0C840", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px #2FE0C820" }}>
          <Command size={20} color="#2FE0C8" />
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#F5F6F8", margin: 0 }}>AI Command Center</h1>
          <p style={{ fontSize: 12, color: "#7A8090", margin: "3px 0 0" }}>Trigger operations, quick launches, and system commands.</p>
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 860 }}>
        <form onSubmit={(e) => { e.preventDefault(); run(input); }} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a command..."
            style={{ flex: 1, padding: "12px 14px", background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 8, color: "#F5F6F8", fontSize: 13, outline: "none", fontFamily: "'JetBrains Mono', monospace" }} />
          <button type="submit" style={{ padding: "0 18px", background: "#2FE0C820", border: "1px solid #2FE0C860", borderRadius: 8, color: "#2FE0C8", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ArrowUp size={14} /> Run
          </button>
        </form>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "#5C616B", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>QUICK LAUNCH</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {QUICK.map((q) => (
              <button key={q.cmd} onClick={() => run(q.cmd)} style={{ padding: "12px 14px", background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 8, color: "#C8CCD4", cursor: "pointer", textAlign: "left", fontSize: 12 }}>
                <div style={{ marginBottom: 4 }}>{q.label}</div>
                <div style={{ fontSize: 10, color: "#5C616B", fontFamily: "'JetBrains Mono', monospace" }}>{q.cmd}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "#5C616B", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>COMMAND LOG</div>
          {log.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#5C616B", fontSize: 12 }}>No commands yet.</div>
          ) : (
            <div style={{ background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 8 }}>
              {log.map((e, i) => (
                <div key={i} style={{ padding: "10px 14px", borderTop: i ? "1px solid #12151C" : "none", display: "flex", gap: 12, alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "#5C616B", fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 }}>{e.ts}</span>
                  <span style={{ color: "#2FE0C8", fontFamily: "'JetBrains Mono', monospace" }}>{e.cmd}</span>
                  <span style={{ color: "#7A8090", marginLeft: "auto" }}>{e.result}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/command")({
  head: () => ({ meta: [{ title: "AI Command Center · Digi OS" }] }),
  component: () => <AppShell><CommandPage /></AppShell>,
});
