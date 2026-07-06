import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { botsRepo, BOT_CATEGORIES, type Bot } from "@/lib/repo";
import { btnPrimary, btnGhost, btnDanger, Field, Label, inputBase, panel } from "./bots";
import { ArrowLeft, Save, Trash2, Copy, Power } from "lucide-react";

export const Route = createFileRoute("/bots/$botId")({
  head: () => ({ meta: [{ title: "Bot · Digi Business OS" }] }),
  component: BotDetail,
});

type Tab = "overview" | "config" | "connections" | "runs";

function BotDetail() {
  const { botId } = Route.useParams();
  const nav = useNavigate();
  const [b, setB] = useState<Bot | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    setB(botsRepo.get(botId));
    setLoaded(true);
    const unsub = botsRepo.subscribe(() => setB(botsRepo.get(botId)));
    return () => { unsub(); };
  }, [botId]);

  if (!b) return (
    <div style={{ maxWidth: 520 }}>
      <Link to="/bots" style={{ ...btnGhost, marginBottom: 16 }}><ArrowLeft size={13}/> All bots</Link>
      <div style={{ padding: 20, borderRadius: 10, border: "1px dashed #1F232C", color: "#8A909C" }}>{loaded ? "Bot not found." : "Loading…"}</div>
    </div>
  );

  const toggle = () => botsRepo.update(b.id, { active: !b.active });
  const remove = () => { if (confirm(`Delete bot "${b.name}"?`)) { botsRepo.remove(b.id); nav({ to: "/bots" }); } };
  const duplicate = () => {
    const c = botsRepo.create({ ...b, name: `${b.name} (copy)`, source: "custom" } as any);
    nav({ to: "/bots/$botId", params: { botId: c.id } });
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <Link to="/bots" style={{ ...btnGhost, marginBottom: 16 }}><ArrowLeft size={13}/> All bots</Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(244,114,182,0.14)", border: "1px solid rgba(244,114,182,0.4)", display: "grid", placeItems: "center" }}>
            <span style={{ color: "#F472B6", fontSize: 18, fontWeight: 700 }}>🤖</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 600 }}>{b.name}</h1>
            <div style={{ fontSize: 11.5, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace" }}>{b.category} · {b.runtime} · {b.source}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={toggle} style={b.active ? btnGhost : btnPrimary}><Power size={13}/> {b.active ? "Disable" : "Enable"}</button>
          <button onClick={duplicate} style={btnGhost}><Copy size={13}/> Duplicate</button>
          <button onClick={remove} style={btnDanger}><Trash2 size={13}/> Delete</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1A1D24", marginBottom: 16 }}>
        {(["overview","config","connections","runs"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 14px", background: "transparent", border: "none", cursor: "pointer",
            color: tab === t ? "#F5F6F8" : "#8A909C", fontSize: 12, textTransform: "capitalize",
            borderBottom: `2px solid ${tab === t ? "#F472B6" : "transparent"}`, marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {tab === "overview" && <Overview b={b} />}
      {tab === "config" && <ConfigEditor b={b} />}
      {tab === "connections" && <Connections b={b} />}
      {tab === "runs" && <Runs />}
    </div>
  );
}

function Overview({ b }: { b: Bot }) {
  return (
    <div style={panel}>
      <Row k="Name" v={b.name} />
      <Row k="Purpose" v={b.purpose} />
      <Row k="Category" v={b.category} />
      <Row k="Runtime" v={b.runtime} />
      <Row k="Source" v={b.source} />
      <Row k="Triggers" v={b.triggers || "—"} />
      <Row k="Tags" v={b.tags || "—"} />
      <Row k="Active" v={b.active ? "Yes" : "No"} />
      <Row k="Bot ID" v={<code style={{ fontSize: 11, color: "#8A909C" }}>{b.id}</code>} />
      <Row k="Created" v={new Date(b.createdAt).toLocaleString()} />
    </div>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #14171E", fontSize: 12.5 }}>
      <span style={{ color: "#8A909C" }}>{k}</span>
      <span style={{ color: "#F5F6F8", maxWidth: "60%", textAlign: "right", overflowWrap: "anywhere" }}>{v}</span>
    </div>
  );
}

function ConfigEditor({ b }: { b: Bot }) {
  const [f, setF] = useState<Partial<Bot>>(b);
  const set = (k: keyof Bot, v: any) => setF((p) => ({ ...p, [k]: v }));
  const save = () => botsRepo.update(b.id, f);

  return (
    <div style={panel}>
      <Label>Bot configuration</Label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Name"><input value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} style={inputBase}/></Field>
        <Field label="Category">
          <select value={f.category} onChange={(e) => set("category", e.target.value)} style={inputBase}>
            {BOT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Purpose"><input value={f.purpose ?? ""} onChange={(e) => set("purpose", e.target.value)} style={inputBase}/></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Runtime">
          <select value={f.runtime} onChange={(e) => set("runtime", e.target.value)} style={inputBase}>
            <option value="agent">Agent</option>
            <option value="workflow">Workflow</option>
            <option value="script">Script</option>
            <option value="external">External</option>
            <option value="custom">Custom</option>
          </select>
        </Field>
        <Field label="Triggers"><input value={f.triggers ?? ""} onChange={(e) => set("triggers", e.target.value)} style={inputBase}/></Field>
      </div>
      <Field label="Instructions / system prompt"><textarea rows={6} value={f.instructions ?? ""} onChange={(e) => set("instructions", e.target.value)} style={{ ...inputBase, resize: "vertical" }}/></Field>
      <Field label="Config (JSON)"><textarea rows={6} value={f.config ?? ""} onChange={(e) => set("config", e.target.value)} style={{ ...inputBase, resize: "vertical", fontFamily: "'JetBrains Mono', monospace" }}/></Field>
      <Field label="Tags"><input value={f.tags ?? ""} onChange={(e) => set("tags", e.target.value)} style={inputBase}/></Field>
      <button onClick={save} style={btnPrimary}><Save size={13}/> Save</button>
    </div>
  );
}

function Connections({ b }: { b: Bot }) {
  const [f, setF] = useState<Partial<Bot>>(b);
  const set = (k: keyof Bot, v: any) => setF((p) => ({ ...p, [k]: v }));
  const save = () => botsRepo.update(b.id, f);
  return (
    <div style={panel}>
      <Label>Connections</Label>
      <div style={{ fontSize: 11.5, color: "#8A909C", marginBottom: 12 }}>
        Bind this bot to an existing agent, workflow, and channels. Backend wires the runtime accordingly.
      </div>
      <Field label="Agent ID"><input value={f.agentId ?? ""} onChange={(e) => set("agentId", e.target.value)} placeholder="agents_…" style={inputBase}/></Field>
      <Field label="Workflow ID"><input value={f.workflowId ?? ""} onChange={(e) => set("workflowId", e.target.value)} placeholder="workflows_…" style={inputBase}/></Field>
      <Field label="Channel IDs (comma-separated)"><input value={f.channelIds ?? ""} onChange={(e) => set("channelIds", e.target.value)} placeholder="channels_…, channels_…" style={inputBase}/></Field>
      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
        <button onClick={save} style={btnPrimary}><Save size={13}/> Save</button>
        <Link to="/agents" style={btnGhost}>Browse agents →</Link>
        <Link to="/workflows" style={btnGhost}>Browse workflows →</Link>
        <Link to="/channels" style={btnGhost}>Manage channels →</Link>
      </div>
    </div>
  );
}

function Runs() {
  return (
    <div style={panel}>
      <Label>Recent runs</Label>
      <div style={{ padding: 24, border: "1px dashed #1F232C", borderRadius: 10, textAlign: "center", color: "#5C616B", fontSize: 12.5 }}>
        No runs yet. Bot execution logs stream here when the backend runtime is wired.
      </div>
    </div>
  );
}
