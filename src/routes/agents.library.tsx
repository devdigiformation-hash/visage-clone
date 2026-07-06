import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { agentsRepo, AGENT_TEMPLATES } from "@/lib/repo";
import { btnPrimary, btnGhost, Label, Field, inputBase, panel, card, grid, emptyCard } from "./bots";
import { ArrowLeft, Bot, Upload, Wand2, Sparkles, Search } from "lucide-react";

export const Route = createFileRoute("/agents/library")({
  head: () => ({ meta: [{ title: "Agent Library · Digi Business OS" }] }),
  component: AgentLibrary,
});

function AgentLibrary() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"library" | "import">("library");
  const [importText, setImportText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const filtered = AGENT_TEMPLATES.filter((t) =>
    !q || (t.name + t.category + t.role + (t.tags || "")).toLowerCase().includes(q.toLowerCase())
  );

  const load = (id: string) => {
    const t = AGENT_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    const a = agentsRepo.create({
      name: t.name, role: t.role, category: t.category,
      source: "template", templateId: t.id, prompt: t.prompt,
      toolIds: t.toolIds, active: true,
    });
    nav({ to: "/agents", search: { highlight: a.id } as any });
  };

  const doImport = () => {
    setErr(null);
    try {
      const parsed = JSON.parse(importText);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      for (const r of rows) {
        if (!r?.name || !r?.role) throw new Error("Each agent needs 'name' and 'role'.");
        agentsRepo.create({
          name: String(r.name), role: String(r.role),
          category: r.category, source: "imported",
          modelId: r.modelId, toolIds: r.toolIds, skillIds: r.skillIds,
          prompt: r.prompt, active: r.active !== false,
        });
      }
      nav({ to: "/agents" });
    } catch (e: any) { setErr(e.message || "Invalid JSON"); }
  };

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", fontFamily: "'Inter', system-ui, sans-serif" }} className="custom-scroll">
        <div style={{ maxWidth: 980 }}>
          <Link to="/agents" style={{ ...btnGhost, marginBottom: 16 }}><ArrowLeft size={13}/> Back to agents</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(167,139,250,0.14)", border: "1px solid rgba(167,139,250,0.4)", display: "grid", placeItems: "center" }}>
              <Bot size={20} color="#A78BFA" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Agent Library</h1>
              <div style={{ fontSize: 12, color: "#8A909C" }}>Load ready-made agents into your workspace or import from JSON.</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <ModeTab active={mode === "library"} onClick={() => setMode("library")} icon={<Sparkles size={13}/>}>Ready-made</ModeTab>
            <ModeTab active={mode === "import"}  onClick={() => setMode("import")}  icon={<Upload size={13}/>}>Import JSON</ModeTab>
            <Link to="/agents" style={{ ...btnGhost, marginLeft: "auto" }}><Wand2 size={13}/> Custom agent</Link>
          </div>

          {mode === "library" && (
            <>
              <div style={{ position: "relative", maxWidth: 340, marginBottom: 14 }}>
                <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#5C616B" }} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agents…" style={{ ...inputBase, paddingLeft: 30 }} />
              </div>
              <Label>Ready-made agents</Label>
              <div style={grid}>
                {filtered.map((t) => (
                  <div key={t.id} style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(167,139,250,0.14)", border: "1px solid rgba(167,139,250,0.4)", display: "grid", placeItems: "center" }}>
                        <Bot size={15} color="#A78BFA" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                        <div style={{ fontSize: 10.5, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace" }}>{t.category}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#A0A6B2", marginTop: 10, lineHeight: 1.45 }}>{t.role}</div>
                    <button onClick={() => load(t.id)} style={{ ...btnPrimary, marginTop: 10 }}>Load agent</button>
                  </div>
                ))}
                {filtered.length === 0 && <div style={emptyCard}>No matches.</div>}
              </div>
            </>
          )}

          {mode === "import" && (
            <div style={panel}>
              <Label>Import agents from JSON</Label>
              <div style={{ fontSize: 11.5, color: "#8A909C", marginBottom: 8 }}>
                Required: <code>name, role</code>. Optional: <code>category, modelId, toolIds, skillIds, prompt, active</code>.
              </div>
              <Field label="JSON">
                <textarea rows={14} value={importText} onChange={(e) => setImportText(e.target.value)}
                  placeholder='[{"name":"Ops Agent","role":"Handles ops tickets","prompt":"…"}]'
                  style={{ ...inputBase, resize: "vertical", fontFamily: "'JetBrains Mono', monospace" }} />
              </Field>
              {err && <div style={{ color: "#F87171", fontSize: 11.5, marginBottom: 8 }}>{err}</div>}
              <button onClick={doImport} disabled={!importText.trim()} style={{ ...btnPrimary, opacity: importText.trim() ? 1 : 0.5 }}>Import</button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function ModeTab({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
      background: active ? "rgba(167,139,250,0.10)" : "transparent",
      border: `1px solid ${active ? "#A78BFA" : "#1F232C"}`,
      color: active ? "#A78BFA" : "#8A909C", fontSize: 12, cursor: "pointer",
    }}>{icon}{children}</button>
  );
}
