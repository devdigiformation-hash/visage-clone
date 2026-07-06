import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { channelsRepo, CHANNEL_CATALOG, type ChannelType } from "@/lib/repo";
import { channelIcon, btnPrimary, btnGhost, SectionLabel } from "./channels";
import { ArrowLeft, Sparkles } from "lucide-react";

type NewSearch = { type?: ChannelType };

export const Route = createFileRoute("/channels/new")({
  head: () => ({ meta: [{ title: "Add Channel · Digi Business OS" }] }),
  validateSearch: (s: Record<string, unknown>): NewSearch => ({
    type: typeof s.type === "string" ? (s.type as ChannelType) : undefined,
  }),
  component: NewChannelPage,
});

function NewChannelPage() {
  const nav = useNavigate();
  const { type: preselected } = Route.useSearch();
  const [type, setType] = useState<ChannelType | undefined>(preselected);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState("");

  const create = () => {
    if (!type || !name.trim()) return;
    const created = channelsRepo.create({
      name: name.trim(),
      type,
      status: "disconnected",
      active: false,
      description,
      webhookUrl: type === "webhook" || type === "custom" ? customEndpoint : undefined,
      config: type === "custom" ? JSON.stringify({ endpoint: customEndpoint }, null, 2) : undefined,
    });
    nav({ to: "/channels/$channelId", params: { channelId: created.id } });
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <Link to="/channels" style={{ ...btnGhost, marginBottom: 16 }}>
        <ArrowLeft size={13} /> All channels
      </Link>

      <h1 style={{ margin: "6px 0 4px", fontSize: 20, fontWeight: 600 }}>Add a channel</h1>
      <div style={{ fontSize: 12, color: "#8A909C", marginBottom: 18 }}>
        Pick a channel type. Configuration happens on the next screen.
      </div>

      <SectionLabel>Channel type</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, marginBottom: 20 }}>
        {CHANNEL_CATALOG.map((c) => {
          const selected = type === c.type;
          return (
            <button key={c.type} onClick={() => setType(c.type)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 10, cursor: "pointer", textAlign: "left",
              background: selected ? `${c.color}14` : "rgba(255,255,255,0.02)",
              border: `1px solid ${selected ? c.color : "#1A1D24"}`,
              color: "#F5F6F8",
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: `${c.color}18`, border: `1px solid ${c.color}55`, display: "grid", placeItems: "center" }}>
                {channelIcon(c.type, 14, c.color)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.label}</div>
                <div style={{ fontSize: 10, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace" }}>{c.setupMethod}</div>
              </div>
            </button>
          );
        })}
      </div>

      {type && (
        <div style={{ padding: 16, borderRadius: 10, border: "1px solid #1A1D24", background: "rgba(255,255,255,0.02)" }}>
          <SectionLabel>Details</SectionLabel>
          <Field label="Channel name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={type === "custom" ? "My Custom Bot" : `${type} channel`} style={input} />
          </Field>
          <Field label="Description">
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this channel used for?" style={input} />
          </Field>
          {(type === "webhook" || type === "custom") && (
            <Field label={type === "custom" ? "Custom endpoint / API URL" : "Webhook URL"}>
              <input value={customEndpoint} onChange={(e) => setCustomEndpoint(e.target.value)} placeholder="https://api.example.com/hook" style={input} />
            </Field>
          )}
          {type === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, padding: 10, borderRadius: 8, background: "rgba(47,224,200,0.06)", border: "1px solid rgba(47,224,200,0.2)", fontSize: 11.5, color: "#8A909C" }}>
              <Sparkles size={13} color="#2FE0C8" />
              Custom channels expose a free-form config panel — connect any API, private bot, or protocol.
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={create} disabled={!name.trim()} style={{ ...btnPrimary, opacity: name.trim() ? 1 : 0.5, cursor: name.trim() ? "pointer" : "not-allowed", border: "1px solid rgba(47,224,200,0.45)" }}>
              Create channel
            </button>
            <Link to="/channels" style={btnGhost}>Cancel</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "#8A909C", textTransform: "uppercase", marginBottom: 5, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      {children}
    </label>
  );
}

const input: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: 8,
  background: "rgba(255,255,255,0.03)", border: "1px solid #1F232C",
  color: "#F5F6F8", fontSize: 12.5, outline: "none",
};
