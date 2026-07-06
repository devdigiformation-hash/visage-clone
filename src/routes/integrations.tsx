import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import {
  integrationsRepo, INTEGRATION_CATALOG, INTEGRATION_CATEGORIES,
  type Integration, type IntegrationStatus, type IntegrationTemplate,
} from "@/lib/repo";
import {
  Plug, Plus, Search, Sparkles, Cpu, Mail, MessageSquare, Chrome, Code2,
  Webhook, Database, FileText, Table2, Cloud, CreditCard, BarChart3,
  GitBranch, Boxes, Zap,
} from "lucide-react";

export const Route = createFileRoute("/integrations")({
  head: () => ({ meta: [
    { title: "Integrations · Digi Business OS" },
    { name: "description", content: "Connect email, browser, APIs, webhooks, CRMs, storage and any custom external system." },
  ]}),
  component: IntegrationsShell,
});

function IntegrationsShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isRoot = pathname === "/integrations" || pathname === "/integrations/";
  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", fontFamily: "'Inter', system-ui, sans-serif" }} className="custom-scroll">
        {isRoot ? <IntegrationsOverview /> : <Outlet />}
      </div>
    </AppShell>
  );
}

// ─── shared helpers exported for sibling routes ────────────────────────
export function categoryIcon(cat: string, size = 14, color = "#F5F6F8") {
  const P = { size, color } as const;
  switch (cat) {
    case "AI Provider":  return <Cpu {...P} />;
    case "Email":        return <Mail {...P} />;
    case "Messaging":    return <MessageSquare {...P} />;
    case "Browser":      return <Chrome {...P} />;
    case "API":          return <Code2 {...P} />;
    case "Webhook":      return <Webhook {...P} />;
    case "CRM":          return <Database {...P} />;
    case "Storage":      return <Cloud {...P} />;
    case "Docs":         return <FileText {...P} />;
    case "Spreadsheet":  return <Table2 {...P} />;
    case "Automation":   return <Zap {...P} />;
    case "Cloud":        return <Cloud {...P} />;
    case "Payments":     return <CreditCard {...P} />;
    case "Analytics":    return <BarChart3 {...P} />;
    case "DevTools":     return <GitBranch {...P} />;
    default:             return <Sparkles {...P} />;
  }
}

export function statusColor(s: IntegrationStatus) {
  return s === "connected" ? "#34D399"
    : s === "pending"     ? "#F5A623"
    : s === "error"       ? "#F43F5E"
    : "#5C616B";
}

export function findTemplate(id?: string | null): IntegrationTemplate | undefined {
  if (!id) return undefined;
  return INTEGRATION_CATALOG.find((t) => t.id === id);
}

// ─── Overview ──────────────────────────────────────────────────────────
function IntegrationsOverview() {
  const [items, setItems] = useState<Integration[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  useEffect(() => {
    setItems(integrationsRepo.list());
    const unsub = integrationsRepo.subscribe(() => setItems(integrationsRepo.list()));
    return () => { unsub(); };
  }, []);

  const filteredCatalog = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return INTEGRATION_CATALOG.filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (!needle) return true;
      return `${t.name} ${t.provider} ${t.category} ${t.blurb}`.toLowerCase().includes(needle);
    });
  }, [q, cat]);

  const connected = items.filter((i) => i.status === "connected").length;
  const pending   = items.filter((i) => i.status === "pending").length;
  const errored   = items.filter((i) => i.status === "error").length;

  return (
    <div>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.35)", display: "grid", placeItems: "center" }}>
            <Plug size={20} color="#F5A623" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>Integrations</h1>
            <div style={{ fontSize: 12, color: "#8A909C" }}>Universal connection layer — email, browser, APIs, webhooks, CRMs, storage & custom systems.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link to="/integrations/new" search={{ custom: 1 } as any} style={btnGhost}>
            <Boxes size={13} /> Custom
          </Link>
          <Link to="/integrations/new" style={btnPrimary}>
            <Plus size={14} /> Add Integration
          </Link>
        </div>
      </div>

      {/* stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 22 }}>
        <Stat label="Connected" value={connected} color="#34D399" />
        <Stat label="Pending"   value={pending}   color="#F5A623" />
        <Stat label="Errors"    value={errored}   color="#F43F5E" />
        <Stat label="Total"     value={items.length} color="#8A909C" />
      </div>

      {/* your integrations */}
      <SectionLabel>Your integrations</SectionLabel>
      {items.length === 0 ? (
        <div style={emptyCard}>
          No integrations connected yet. Pick one from the catalog below or <Link to="/integrations/new" search={{ custom: 1 } as any} style={{ color: "#2FE0C8" }}>add a custom integration</Link>.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
          {items.map((it) => {
            const tpl = findTemplate(it.templateId);
            const color = tpl?.color ?? "#F5A623";
            return (
              <Link key={it.id} to="/integrations/$integrationId" params={{ integrationId: it.id }} style={rowCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}55`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {categoryIcon(it.category, 14, color)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
                    <div style={{ fontSize: 10.5, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{it.category} · {it.method}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: statusColor(it.status), display: "flex", alignItems: "center", gap: 6 }}>
                    <StatusDot s={it.status} /> {it.status}
                  </span>
                  <span style={{ fontSize: 10.5, color: "#5C616B" }}>Open →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* catalog */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <SectionLabel>Available integrations</SectionLabel>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={12} color="#5C616B" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search integrations…"
              style={{ padding: "6px 10px 6px 26px", background: "rgba(255,255,255,0.03)", border: "1px solid #1F232C", borderRadius: 8, color: "#F5F6F8", fontSize: 12, width: 200, outline: "none" }} />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)}
            style={{ padding: "6px 10px", background: "rgba(255,255,255,0.03)", border: "1px solid #1F232C", borderRadius: 8, color: "#C8CCD4", fontSize: 12, outline: "none" }}>
            <option value="All">All categories</option>
            {INTEGRATION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={grid}>
        {filteredCatalog.map((t) => (
          <Link key={t.id} to="/integrations/new" search={{ templateId: t.id } as any} style={catalogCard(t.color)}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${t.color}18`, border: `1px solid ${t.color}55`, display: "grid", placeItems: "center" }}>
                {categoryIcon(t.category, 16, t.color)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 10.5, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace" }}>{t.category} · {t.method}</div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: "#A0A6B2", marginTop: 10, lineHeight: 1.45 }}>{t.blurb}</div>
            <div style={{ marginTop: 10, fontSize: 10.5, color: t.color, display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={11} /> Connect
            </div>
          </Link>
        ))}
        {filteredCatalog.length === 0 && (
          <div style={emptyCard}>No integrations match your filters.</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid #1A1D24" }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.14em", color: "#5C616B", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function StatusDot({ s }: { s: IntegrationStatus }) {
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 999, background: statusColor(s), boxShadow: `0 0 6px ${statusColor(s)}` }} />;
}

// ─── shared styles (exported) ──────────────────────────────────────────
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
  ...btnGhost, color: "#F87171", borderColor: "rgba(244,63,94,0.35)",
  background: "rgba(244,63,94,0.08)",
};

const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 };
const catalogCard = (color: string): React.CSSProperties => ({
  display: "block", padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.02)",
  border: "1px solid #1A1D24", textDecoration: "none", color: "#F5F6F8",
  transition: "border-color .18s, background .18s",
  boxShadow: `inset 0 0 0 1px transparent`,
  borderColor: `${color}22`,
});
const rowCard: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
  padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)",
  border: "1px solid #1A1D24", textDecoration: "none", color: "#F5F6F8",
};
const emptyCard: React.CSSProperties = {
  padding: 20, borderRadius: 10, border: "1px dashed #1F232C",
  background: "rgba(255,255,255,0.02)", color: "#8A909C", fontSize: 12.5, textAlign: "center",
};

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10.5, letterSpacing: "0.14em", color: "#5C616B", fontFamily: "'JetBrains Mono', monospace", margin: "0 0 10px 2px", textTransform: "uppercase" }}>{children}</div>;
}
