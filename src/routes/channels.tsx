import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { channelsRepo, CHANNEL_CATALOG, type Channel, type ChannelStatus } from "@/lib/repo";
import {
  MessageSquare, Plus, Phone, Send, Hash, Mail, MessageCircle, Globe, Webhook, Sparkles,
  Settings2, RefreshCw, Power,
} from "lucide-react";

export const Route = createFileRoute("/channels")({
  head: () => ({ meta: [
    { title: "Channels · Digi Business OS" },
    { name: "description", content: "Connect and manage WhatsApp, Telegram, Discord, Email and custom communication channels." },
  ]}),
  component: ChannelsShell,
});

function ChannelsShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isRoot = pathname === "/channels" || pathname === "/channels/";
  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", fontFamily: "'Inter', system-ui, sans-serif" }} className="custom-scroll">
        {isRoot ? <ChannelsOverview /> : <Outlet />}
      </div>
    </AppShell>
  );
}

// ─── Icons per channel type ────────────────────────────────────────────
export function channelIcon(type: string, size = 16, color = "#F5F6F8") {
  const P = { size, color } as const;
  switch (type) {
    case "whatsapp": return <Phone {...P} />;
    case "telegram": return <Send {...P} />;
    case "discord":  return <Hash {...P} />;
    case "slack":    return <Hash {...P} />;
    case "email":    return <Mail {...P} />;
    case "sms":      return <MessageCircle {...P} />;
    case "web":      return <Globe {...P} />;
    case "webhook":  return <Webhook {...P} />;
    default:         return <Sparkles {...P} />;
  }
}

export function statusColor(s: ChannelStatus) {
  return s === "connected" ? "#34D399"
    : s === "pending" ? "#F5A623"
    : s === "error"   ? "#F43F5E"
    : "#5C616B";
}

function StatusDot({ s }: { s: ChannelStatus }) {
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 999, background: statusColor(s), boxShadow: `0 0 6px ${statusColor(s)}` }} />;
}

// ─── Overview ──────────────────────────────────────────────────────────
function ChannelsOverview() {
  const [items, setItems] = useState<Channel[]>([]);
  useEffect(() => {
    setItems(channelsRepo.list());
    const unsub = channelsRepo.subscribe(() => setItems(channelsRepo.list()));
    return () => { unsub(); };
  }, []);

  const connected = items.filter((c) => c.status === "connected").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", display: "grid", placeItems: "center" }}>
            <MessageSquare size={20} color="#22C55E" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>Channels</h1>
            <div style={{ fontSize: 12, color: "#8A909C" }}>Communication hub — connect WhatsApp, Telegram, Discord, Email and custom channels.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace" }}>
            {connected}/{items.length} connected
          </div>
          <Link to="/channels/new" style={btnPrimary}>
            <Plus size={14} /> Add Channel
          </Link>
        </div>
      </div>

      {/* Catalog */}
      <SectionLabel>Available channels</SectionLabel>
      <div style={grid}>
        {CHANNEL_CATALOG.map((c) => (
          <Link key={c.type} to="/channels/new" search={{ type: c.type } as any} style={catalogCard(c.color)}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${c.color}18`, border: `1px solid ${c.color}55`, display: "grid", placeItems: "center" }}>
                {channelIcon(c.type, 16, c.color)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
                <div style={{ fontSize: 10.5, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace" }}>{c.setupMethod}</div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: "#A0A6B2", marginTop: 10, lineHeight: 1.45 }}>{c.blurb}</div>
            <div style={{ marginTop: 10, fontSize: 10.5, color: c.color, display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={11} /> Connect
            </div>
          </Link>
        ))}
      </div>

      {/* Connected list */}
      <div style={{ marginTop: 26 }}>
        <SectionLabel>Your channels</SectionLabel>
        {items.length === 0 ? (
          <div style={emptyCard}>
            No channels yet. Pick one from the catalog above or <Link to="/channels/new" style={{ color: "#2FE0C8" }}>add a custom channel</Link>.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {items.map((ch) => {
              const meta = CHANNEL_CATALOG.find((c) => c.type === ch.type);
              const color = meta?.color ?? "#8A909C";
              return (
                <Link key={ch.id} to="/channels/$channelId" params={{ channelId: ch.id }} style={rowCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}55`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                      {channelIcon(ch.type, 14, color)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.name}</div>
                      <div style={{ fontSize: 10.5, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{ch.type} · {meta?.setupMethod}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: statusColor(ch.status), display: "flex", alignItems: "center", gap: 6 }}>
                      <StatusDot s={ch.status} /> {ch.status}
                    </span>
                    <span style={{ fontSize: 10.5, color: "#5C616B" }}>Open →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10.5, letterSpacing: "0.14em", color: "#5C616B", fontFamily: "'JetBrains Mono', monospace", margin: "0 0 10px 2px", textTransform: "uppercase" }}>{children}</div>;
}

export { SectionLabel };

// Re-export button icons so detail routes can share
export { Settings2, RefreshCw, Power };
