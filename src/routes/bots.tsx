import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { botsRepo, BOT_TEMPLATES, BOT_CATEGORIES, type Bot } from "@/lib/repo";
import { Sparkles, Plus, Upload, Search, Bot as BotIcon } from "lucide-react";

export const Route = createFileRoute("/bots")({
  head: () => ({ meta: [
    { title: "Bots · Digi Business OS" },
    { name: "description", content: "Ready-made bots plus custom bot builder and import — WhatsApp, Telegram, Discord, workflow bots and more." },
  ]}),
  component: BotsShell,
});

function BotsShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isRoot = pathname === "/bots" || pathname === "/bots/";
  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", fontFamily: "'Inter', system-ui, sans-serif" }} className="custom-scroll">
        {isRoot ? <BotsOverview /> : <Outlet />}
      </div>
    </AppShell>
  );
}

function BotsOverview() {
  const [items, setItems] = useState<Bot[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  useEffect(() => {
    setItems(botsRepo.list());
    const unsub = botsRepo.subscribe(() => setItems(botsRepo.list()));
    return () => { unsub(); };
  }, []);

  const filteredTemplates = useMemo(() => BOT_TEMPLATES.filter((t) => {
    if (cat !== "All" && t.category !== cat) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return t.name.toLowerCase().includes(s) || t.purpose.toLowerCase().includes(s) || (t.tags || "").includes(s);
  }), [q, cat]);

  const active = items.filter((b) => b.active).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.35)", display: "grid", placeItems: "center" }}>
            <Sparkles size={20} color="#F472B6" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>Bots</h1>
            <div style={{ fontSize: 12, color: "#8A909C" }}>Ready-made bots · custom builder · import from JSON. Backend-ready.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace" }}>{active}/{items.length} active</div>
          <Link to="/bots/new" search={{ mode: "import" } as any} style={btnGhost}><Upload size={13}/> Import</Link>
          <Link to="/bots/new" style={btnPrimary}><Plus size={14}/> New Bot</Link>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 340 }}>
          <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#5C616B" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search bot templates…" style={inputSearch} />
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {(["All", ...BOT_CATEGORIES] as string[]).map((c) => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: "5px 10px", borderRadius: 999, fontSize: 11, cursor: "pointer",
              border: `1px solid ${cat === c ? "#F472B6" : "#1F232C"}`,
              background: cat === c ? "rgba(244,114,182,0.10)" : "transparent",
              color: cat === c ? "#F472B6" : "#8A909C",
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Template gallery */}
      <Label>Ready-made bots · load into your workspace</Label>
      <div style={grid}>
        {filteredTemplates.map((t) => (
          <Link key={t.id} to="/bots/new" search={{ templateId: t.id } as any} style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(244,114,182,0.14)", border: "1px solid rgba(244,114,182,0.4)", display: "grid", placeItems: "center" }}>
                <BotIcon size={15} color="#F472B6" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                <div style={{ fontSize: 10.5, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace" }}>{t.category} · {t.runtime}</div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: "#A0A6B2", marginTop: 10, lineHeight: 1.45 }}>{t.purpose}</div>
            <div style={{ marginTop: 10, fontSize: 10.5, color: "#F472B6", display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={11} /> Load bot
            </div>
          </Link>
        ))}
        {filteredTemplates.length === 0 && (
          <div style={emptyCard}>No matching templates. Try a different category or <Link to="/bots/new" style={{ color: "#2FE0C8" }}>create a custom bot</Link>.</div>
        )}
      </div>

      {/* Your bots */}
      <div style={{ marginTop: 26 }}>
        <Label>Your bots</Label>
        {items.length === 0 ? (
          <div style={emptyCard}>No bots yet. Load a template above or <Link to="/bots/new" style={{ color: "#2FE0C8" }}>build a custom bot</Link>.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {items.map((b) => (
              <Link key={b.id} to="/bots/$botId" params={{ botId: b.id }} style={row}>
                <div style={{ display: "flex", gap: 12, minWidth: 0, alignItems: "center" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(244,114,182,0.14)", border: "1px solid rgba(244,114,182,0.4)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <BotIcon size={14} color="#F472B6" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div>
                    <div style={{ fontSize: 10.5, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace" }}>{b.category} · {b.runtime} · {b.source}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: b.active ? "#34D399" : "#5C616B" }}>{b.active ? "● active" : "○ idle"}</span>
                  <span style={{ fontSize: 10.5, color: "#5C616B" }}>Open →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────
export const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px",
  background: "linear-gradient(180deg, rgba(47,224,200,0.18), rgba(47,224,200,0.08))",
  border: "1px solid rgba(47,224,200,0.45)", borderRadius: 8, color: "#2FE0C8",
  fontSize: 12, fontWeight: 500, textDecoration: "none", cursor: "pointer",
};
export const btnGhost: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px",
  background: "rgba(255,255,255,0.03)", border: "1px solid #1F232C", borderRadius: 8,
  color: "#C8CCD4", fontSize: 12, cursor: "pointer", textDecoration: "none",
};
export const btnDanger: React.CSSProperties = {
  ...btnGhost, color: "#F87171", borderColor: "rgba(244,63,94,0.35)", background: "rgba(244,63,94,0.08)",
};
export const inputSearch: React.CSSProperties = {
  width: "100%", padding: "7px 10px 7px 30px", fontSize: 12,
  background: "rgba(255,255,255,0.03)", border: "1px solid #1F232C",
  color: "#F5F6F8", borderRadius: 8, outline: "none",
};
export const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 };
export const card: React.CSSProperties = {
  display: "block", padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.02)",
  border: "1px solid #1A1D24", textDecoration: "none", color: "#F5F6F8",
};
export const row: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
  padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)",
  border: "1px solid #1A1D24", textDecoration: "none", color: "#F5F6F8",
};
export const emptyCard: React.CSSProperties = {
  padding: 20, borderRadius: 10, border: "1px dashed #1F232C",
  background: "rgba(255,255,255,0.02)", color: "#8A909C", fontSize: 12.5, textAlign: "center",
};
export const panel: React.CSSProperties = {
  padding: 16, borderRadius: 10, border: "1px solid #1A1D24", background: "rgba(255,255,255,0.02)",
};
export const inputBase: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: 8,
  background: "rgba(255,255,255,0.03)", border: "1px solid #1F232C",
  color: "#F5F6F8", fontSize: 12.5, outline: "none",
};

export function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10.5, letterSpacing: "0.14em", color: "#5C616B", fontFamily: "'JetBrains Mono', monospace", margin: "0 0 10px 2px", textTransform: "uppercase" }}>{children}</div>;
}
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "#8A909C", textTransform: "uppercase", marginBottom: 5, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      {children}
    </label>
  );
}
