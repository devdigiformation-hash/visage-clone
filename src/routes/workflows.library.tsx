import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { workflowsRepo, WORKFLOW_TEMPLATES } from "@/lib/repo";
import { btnPrimary, btnGhost, Label, Field, inputBase, panel, card, grid, emptyCard } from "./bots";
import { ArrowLeft, Workflow as WfIcon, Upload, Wand2, Sparkles, Search } from "lucide-react";

export const Route = createFileRoute("/workflows/library")({
  head: () => ({ meta: [{ title: "Workflow Library · Digi Business OS" }] }),
  component: WorkflowLibrary,
});

function WorkflowLibrary() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"library" | "import">("library");
  const [importText, setImportText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const filtered = WORKFLOW_TEMPLATES.filter((t) =>
    !q || (t.name + t.category + t.trigger).toLowerCase().includes(q.toLowerCase())
  );

  const load = (id: string) => {
    const t = WORKFLOW_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    workflowsRepo.create({
      name: t.name, trigger: t.trigger, category: t.category,
      source: "template", templateId: t.id, steps: t.steps, status: "draft",
    });
    nav({ to: "/workflows" });
  };

  const doImport = () => {
    setErr(null);
    try {
      const parsed = JSON.parse(importText);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      for (const r of rows) {
        if (!r?.name) throw new Error("Each workflow needs 'name'.");
        workflowsRepo.create({
          name: String(r.name), trigger: r.trigger || "manual",
          category: r.category, source: "imported",
          steps: r.steps, status: r.status || "draft", notes: r.notes,
        });
      }
      nav({ to: "/workflows" });
    } catch (e: any) { setErr(e.message || "Invalid JSON"); }
  };

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", fontFamily: "'Inter', system-ui, sans-serif" }} className="custom-scroll">
        <div style={{ maxWidth: 980 }}>
          <Link to="/workflows" style={{ ...btnGhost, marginBottom: 16 }}><ArrowLeft size={13}/> Back to workflows</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.4)", display: "grid", placeItems: "center" }}>
              <WfIcon size={20} color="#8B5CF6" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Workflow Library</h1>
              <div style={{ fontSize: 12, color: "#8A909C" }}>Load ready-made workflows or import from JSON.</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <ModeTab active={mode === "library"} onClick={() => setMode("library")} icon={<Sparkles size={13}/>}>Ready-made</ModeTab>
            <ModeTab active={mode === "import"}  onClick={() => setMode("import")}  icon={<Upload size={13}/>}>Import JSON</ModeTab>
            <Link to="/workflows" style={{ ...btnGhost, marginLeft: "auto" }}><Wand2 size={13}/> Custom workflow</Link>
          </div>

          {mode === "library" && (
            <>
              <div style={{ position: "relative", maxWidth: 340, marginBottom: 14 }}>
                <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#5C616B" }} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search workflows…" style={{ ...inputBase, paddingLeft: 30 }} />
              </div>
              <Label>Ready-made workflows</Label>
              <div style={grid}>
                {filtered.map((t) => (
                  <div key={t.id} style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.4)", display: "grid", placeItems: "center" }}>
                        <WfIcon size={15} color="#8B5CF6" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                        <div style={{ fontSize: 10.5, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace" }}>{t.category} · {t.trigger}</div>
                      </div>
                    </div>
                    <pre style={{ fontSize: 11, color: "#A0A6B2", marginTop: 10, lineHeight: 1.45, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "pre-wrap" }}>{t.steps}</pre>
                    <button onClick={() => load(t.id)} style={{ ...btnPrimary, marginTop: 10 }}>Load workflow</button>
                  </div>
                ))}
                {filtered.length === 0 && <div style={emptyCard}>No matches.</div>}
              </div>
            </>
          )}

          {mode === "import" && (
            <div style={panel}>
              <Label>Import workflows from JSON</Label>
              <div style={{ fontSize: 11.5, color: "#8A909C", marginBottom: 8 }}>
                Required: <code>name</code>. Optional: <code>trigger, category, steps, status, notes</code>.
              </div>
              <Field label="JSON">
                <textarea rows={14} value={importText} onChange={(e) => setImportText(e.target.value)}
                  placeholder='[{"name":"Nightly Backup","trigger":"schedule","steps":"…"}]'
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
      background: active ? "rgba(139,92,246,0.10)" : "transparent",
      border: `1px solid ${active ? "#8B5CF6" : "#1F232C"}`,
      color: active ? "#8B5CF6" : "#8A909C", fontSize: 12, cursor: "pointer",
    }}>{icon}{children}</button>
  );
}
