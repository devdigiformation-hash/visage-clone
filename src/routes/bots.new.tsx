import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { botsRepo, BOT_TEMPLATES, BOT_CATEGORIES, type Bot } from "@/lib/repo";
import { btnPrimary, btnGhost, Field, Label, inputBase, panel } from "./bots";
import { ArrowLeft, Sparkles, Upload, Wand2 } from "lucide-react";

type Search = { templateId?: string; mode?: "custom" | "import" };

export const Route = createFileRoute("/bots/new")({
  head: () => ({ meta: [{ title: "New Bot · Digi Business OS" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    templateId: typeof s.templateId === "string" ? s.templateId : undefined,
    mode: s.mode === "import" || s.mode === "custom" ? s.mode : undefined,
  }),
  component: NewBot,
});

function NewBot() {
  const nav = useNavigate();
  const { templateId, mode: initialMode } = Route.useSearch();
  const tpl = templateId ? BOT_TEMPLATES.find((t) => t.id === templateId) : undefined;
  const [mode, setMode] = useState<"template" | "custom" | "import">(
    tpl ? "template" : initialMode === "import" ? "import" : "custom"
  );

  return (
    <div style={{ maxWidth: 820 }}>
      <Link to="/bots" style={{ ...btnGhost, marginBottom: 16 }}><ArrowLeft size={13}/> All bots</Link>
      <h1 style={{ margin: "6px 0 4px", fontSize: 20, fontWeight: 600 }}>Add a bot</h1>
      <div style={{ fontSize: 12, color: "#8A909C", marginBottom: 18 }}>
        Load a ready-made template, build a custom bot, or import from JSON.
      </div>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <ModeTab active={mode === "template"} onClick={() => setMode("template")} icon={<Sparkles size={13}/>}>From template</ModeTab>
        <ModeTab active={mode === "custom"}   onClick={() => setMode("custom")}   icon={<Wand2 size={13}/>}>Custom build</ModeTab>
        <ModeTab active={mode === "import"}   onClick={() => setMode("import")}   icon={<Upload size={13}/>}>Import JSON</ModeTab>
      </div>

      {mode === "template" && <TemplatePicker preselectedId={templateId} onCreate={(b) => nav({ to: "/bots/$botId", params: { botId: b.id } })} />}
      {mode === "custom"   && <CustomBuilder                       onCreate={(b) => nav({ to: "/bots/$botId", params: { botId: b.id } })} />}
      {mode === "import"   && <ImportForm                          onCreate={(b) => nav({ to: "/bots/$botId", params: { botId: b.id } })} />}
    </div>
  );
}

function ModeTab({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
      background: active ? "rgba(244,114,182,0.10)" : "transparent",
      border: `1px solid ${active ? "#F472B6" : "#1F232C"}`,
      color: active ? "#F472B6" : "#8A909C", fontSize: 12, cursor: "pointer",
    }}>{icon}{children}</button>
  );
}

function TemplatePicker({ preselectedId, onCreate }: { preselectedId?: string; onCreate: (b: Bot) => void }) {
  const [selId, setSelId] = useState<string | undefined>(preselectedId);
  const tpl = selId ? BOT_TEMPLATES.find((t) => t.id === selId) : undefined;
  const [name, setName] = useState(tpl?.name ?? "");
  const [purpose, setPurpose] = useState(tpl?.purpose ?? "");

  const pick = (id: string) => {
    setSelId(id);
    const t = BOT_TEMPLATES.find((x) => x.id === id);
    if (t) { setName(t.name); setPurpose(t.purpose); }
  };

  const load = () => {
    if (!tpl) return;
    const b = botsRepo.create({
      name: name.trim() || tpl.name,
      purpose: purpose.trim() || tpl.purpose,
      category: tpl.category,
      runtime: tpl.runtime,
      source: "template",
      templateId: tpl.id,
      triggers: tpl.triggers,
      instructions: tpl.instructions,
      tags: tpl.tags,
      active: true,
    });
    onCreate(b);
  };

  return (
    <div>
      <Label>Choose a template</Label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginBottom: 16 }}>
        {BOT_TEMPLATES.map((t) => (
          <button key={t.id} onClick={() => pick(t.id)} style={{
            textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
            background: selId === t.id ? "rgba(244,114,182,0.10)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${selId === t.id ? "#F472B6" : "#1A1D24"}`,
            color: "#F5F6F8",
          }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{t.name}</div>
            <div style={{ fontSize: 10.5, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{t.category} · {t.runtime}</div>
            <div style={{ fontSize: 11.5, color: "#A0A6B2", marginTop: 6, lineHeight: 1.4 }}>{t.purpose}</div>
          </button>
        ))}
      </div>

      {tpl && (
        <div style={panel}>
          <Label>Customise before loading</Label>
          <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} style={inputBase} /></Field>
          <Field label="Purpose"><input value={purpose} onChange={(e) => setPurpose(e.target.value)} style={inputBase} /></Field>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={load} style={btnPrimary}>Load into workspace</button>
            <Link to="/bots" style={btnGhost}>Cancel</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomBuilder({ onCreate }: { onCreate: (b: Bot) => void }) {
  const [f, setF] = useState<Partial<Bot>>({ runtime: "agent", category: "Custom", triggers: "message", active: true });
  const set = (k: keyof Bot, v: any) => setF((p) => ({ ...p, [k]: v }));

  const create = () => {
    if (!f.name?.trim() || !f.purpose?.trim()) return;
    const b = botsRepo.create({
      name: f.name!.trim(), purpose: f.purpose!.trim(),
      category: f.category || "Custom",
      runtime: (f.runtime as Bot["runtime"]) || "agent",
      source: "custom",
      triggers: f.triggers, instructions: f.instructions,
      channelIds: f.channelIds, agentId: f.agentId, workflowId: f.workflowId,
      tags: f.tags, active: !!f.active,
    });
    onCreate(b);
  };

  return (
    <div style={panel}>
      <Label>Custom bot</Label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Name *"><input value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Order Status Bot" style={inputBase} /></Field>
        <Field label="Category">
          <select value={f.category} onChange={(e) => set("category", e.target.value)} style={inputBase}>
            {BOT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Purpose *"><input value={f.purpose ?? ""} onChange={(e) => set("purpose", e.target.value)} placeholder="What does this bot do?" style={inputBase} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Runtime">
          <select value={f.runtime} onChange={(e) => set("runtime", e.target.value)} style={inputBase}>
            <option value="agent">Agent-backed</option>
            <option value="workflow">Workflow-backed</option>
            <option value="script">Script</option>
            <option value="external">External bot (API/webhook)</option>
            <option value="custom">Custom runtime</option>
          </select>
        </Field>
        <Field label="Triggers (comma)"><input value={f.triggers ?? ""} onChange={(e) => set("triggers", e.target.value)} placeholder="message, cron, webhook" style={inputBase} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Agent ID (optional)"><input value={f.agentId ?? ""} onChange={(e) => set("agentId", e.target.value)} placeholder="agents_…" style={inputBase} /></Field>
        <Field label="Workflow ID (optional)"><input value={f.workflowId ?? ""} onChange={(e) => set("workflowId", e.target.value)} placeholder="workflows_…" style={inputBase} /></Field>
      </div>
      <Field label="Channels (comma-separated channel IDs)"><input value={f.channelIds ?? ""} onChange={(e) => set("channelIds", e.target.value)} style={inputBase} /></Field>
      <Field label="Instructions / system prompt"><textarea rows={5} value={f.instructions ?? ""} onChange={(e) => set("instructions", e.target.value)} style={{ ...inputBase, resize: "vertical" }} /></Field>
      <Field label="Tags"><input value={f.tags ?? ""} onChange={(e) => set("tags", e.target.value)} placeholder="comma,separated" style={inputBase} /></Field>

      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button onClick={create} disabled={!f.name?.trim() || !f.purpose?.trim()} style={{ ...btnPrimary, opacity: (f.name?.trim() && f.purpose?.trim()) ? 1 : 0.5 }}>Create bot</button>
        <Link to="/bots" style={btnGhost}>Cancel</Link>
      </div>
    </div>
  );
}

function ImportForm({ onCreate }: { onCreate: (b: Bot) => void }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const doImport = () => {
    setErr(null);
    try {
      const parsed = JSON.parse(text);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      let last: Bot | null = null;
      for (const r of rows) {
        if (!r?.name || !r?.purpose) throw new Error("Each bot needs 'name' and 'purpose'.");
        last = botsRepo.create({
          name: String(r.name), purpose: String(r.purpose),
          category: r.category || "Custom",
          runtime: (r.runtime as Bot["runtime"]) || "agent",
          source: "imported",
          triggers: r.triggers, instructions: r.instructions,
          channelIds: r.channelIds, tags: r.tags,
          active: r.active !== false,
        });
      }
      if (last) onCreate(last);
    } catch (e: any) { setErr(e.message || "Invalid JSON"); }
  };

  return (
    <div style={panel}>
      <Label>Import bot(s) from JSON</Label>
      <div style={{ fontSize: 11.5, color: "#8A909C", marginBottom: 8, lineHeight: 1.5 }}>
        Paste one bot or an array. Required: <code>name</code>, <code>purpose</code>. Optional: <code>category, runtime, triggers, instructions, tags, active</code>.
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14}
        placeholder='{"name":"KB Bot","purpose":"Answer from KB","runtime":"agent","category":"Support"}'
        style={{ ...inputBase, resize: "vertical", fontFamily: "'JetBrains Mono', monospace" }} />
      {err && <div style={{ color: "#F87171", fontSize: 11.5, marginTop: 8 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={doImport} disabled={!text.trim()} style={{ ...btnPrimary, opacity: text.trim() ? 1 : 0.5 }}>Import</button>
        <Link to="/bots" style={btnGhost}>Cancel</Link>
      </div>
    </div>
  );
}
