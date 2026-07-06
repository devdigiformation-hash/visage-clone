import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { channelsRepo, CHANNEL_CATALOG, type Channel, type ChannelStatus, type ChannelType } from "@/lib/repo";
import { channelIcon, statusColor, btnPrimary, btnGhost, btnDanger, SectionLabel } from "./channels";
import { ArrowLeft, RefreshCw, Power, Trash2, Save, QrCode, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/channels/$channelId")({
  head: () => ({ meta: [{ title: "Channel · Digi Business OS" }] }),
  component: ChannelDetail,
});

type Tab = "overview" | "setup" | "webhooks" | "automation" | "logs";

function ChannelDetail() {
  const { channelId } = Route.useParams();
  const nav = useNavigate();
  const [ch, setCh] = useState<Channel | undefined>(() => channelsRepo.get(channelId));
  const [tab, setTab] = useState<Tab>("setup");

  useEffect(() => {
    const unsub = channelsRepo.subscribe(() => setCh(channelsRepo.get(channelId)));
    return () => { unsub(); };
  }, [channelId]);

  if (!ch) {
    return (
      <div style={{ maxWidth: 520 }}>
        <Link to="/channels" style={{ ...btnGhost, marginBottom: 16 }}><ArrowLeft size={13}/> All channels</Link>
        <div style={{ padding: 20, borderRadius: 10, border: "1px dashed #1F232C", color: "#8A909C" }}>Channel not found.</div>
      </div>
    );
  }

  const meta = CHANNEL_CATALOG.find((c) => c.type === ch.type);
  const color = meta?.color ?? "#8A909C";

  const setStatus = (s: ChannelStatus) => channelsRepo.update(ch.id, { status: s, lastConnectedAt: s === "connected" ? Date.now() : ch.lastConnectedAt });
  const remove = () => { if (confirm(`Delete channel "${ch.name}"?`)) { channelsRepo.remove(ch.id); nav({ to: "/channels" }); } };

  return (
    <div style={{ maxWidth: 900 }}>
      <Link to="/channels" style={{ ...btnGhost, marginBottom: 16 }}><ArrowLeft size={13}/> All channels</Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}55`, display: "grid", placeItems: "center" }}>
            {channelIcon(ch.type, 20, color)}
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.name}</h1>
            <div style={{ fontSize: 11.5, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
              {ch.type} · {meta?.setupMethod}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: statusColor(ch.status), display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, background: `${statusColor(ch.status)}18`, border: `1px solid ${statusColor(ch.status)}55` }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: statusColor(ch.status) }} /> {ch.status}
          </span>
          {ch.status === "connected"
            ? <button onClick={() => setStatus("disconnected")} style={btnGhost}><Power size={13}/> Disconnect</button>
            : <button onClick={() => setStatus("connected")} style={btnPrimary}><Power size={13}/> Connect</button>}
          <button onClick={() => setStatus("pending")} style={btnGhost}><RefreshCw size={13}/> Refresh</button>
          <button onClick={remove} style={btnDanger}><Trash2 size={13}/> Delete</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1A1D24", marginBottom: 16 }}>
        {(["setup", "overview", "webhooks", "automation", "logs"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 14px", background: "transparent", border: "none", cursor: "pointer",
            color: tab === t ? "#F5F6F8" : "#8A909C", fontSize: 12, textTransform: "capitalize",
            borderBottom: `2px solid ${tab === t ? "#2FE0C8" : "transparent"}`,
            marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab ch={ch} />}
      {tab === "setup" && <SetupTab ch={ch} />}
      {tab === "webhooks" && <WebhooksTab ch={ch} />}
      {tab === "automation" && <AutomationTab ch={ch} />}
      {tab === "logs" && <LogsTab ch={ch} />}
    </div>
  );
}

// ─── Overview ──────────────────────────────────────────────
function OverviewTab({ ch }: { ch: Channel }) {
  return (
    <div style={panel}>
      <Row k="Name" v={ch.name} />
      <Row k="Type" v={ch.type} />
      <Row k="Status" v={ch.status} />
      <Row k="Description" v={ch.description || "—"} />
      <Row k="Last connected" v={ch.lastConnectedAt ? new Date(ch.lastConnectedAt).toLocaleString() : "Never"} />
      <Row k="Created" v={new Date(ch.createdAt).toLocaleString()} />
      <Row k="Channel ID" v={<code style={{ fontSize: 11, color: "#8A909C" }}>{ch.id}</code>} />
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

// ─── Setup (type-specific) ─────────────────────────────────
function SetupTab({ ch }: { ch: Channel }) {
  switch (ch.type) {
    case "whatsapp": return <WhatsAppSetup ch={ch} />;
    case "telegram": return <TelegramSetup ch={ch} />;
    case "discord":  return <DiscordSetup ch={ch} />;
    case "slack":    return <SlackSetup ch={ch} />;
    case "email":    return <EmailSetup ch={ch} />;
    case "sms":      return <SmsSetup ch={ch} />;
    case "web":      return <WebSetup ch={ch} />;
    case "webhook":  return <WebhookSetup ch={ch} />;
    case "custom":   return <CustomSetup ch={ch} />;
  }
}

function useField<T extends Partial<Channel>>(ch: Channel) {
  const [draft, setDraft] = useState<T>({ ...ch } as unknown as T);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify({ ...ch, ...draft } as any) || Object.keys(draft).some((k) => (ch as any)[k] !== (draft as any)[k]), [draft, ch]);
  const save = () => { channelsRepo.update(ch.id, draft as Partial<Channel>); };
  return { draft, setDraft, dirty, save };
}

// WhatsApp — QR flow shell
function WhatsAppSetup({ ch }: { ch: Channel }) {
  const { draft, setDraft, save } = useField<Partial<Channel>>(ch);
  const [scanning, setScanning] = useState(false);

  const startQr = () => {
    setScanning(true);
    channelsRepo.update(ch.id, { status: "pending", sessionId: `wa_${Date.now().toString(36)}` });
    // In real backend: open socket, stream QR, resolve on scan.
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={panel}>
        <SectionLabel>Connect via QR</SectionLabel>
        <div style={{
          aspectRatio: "1", background: "#0A0C12", border: "1px dashed #22C55E55",
          borderRadius: 12, display: "grid", placeItems: "center", position: "relative", overflow: "hidden",
        }}>
          {scanning || ch.status === "pending" ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <QrCode size={100} color="#22C55E" style={{ opacity: 0.85 }} />
              <div style={{ marginTop: 12, fontSize: 11.5, color: "#8A909C" }}>Waiting for backend QR stream…</div>
              <div style={{ fontSize: 10, color: "#5C616B", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>session: {ch.sessionId ?? "—"}</div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 20 }}>
              <QrCode size={80} color="#5C616B" />
              <div style={{ marginTop: 10, fontSize: 12, color: "#8A909C" }}>Press start to request a QR code</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={startQr} style={btnPrimary}><RefreshCw size={13}/> {ch.status === "pending" ? "Regenerate QR" : "Start QR session"}</button>
          <button onClick={() => channelsRepo.update(ch.id, { status: "connected", lastConnectedAt: Date.now() })} style={btnGhost}>Mark as scanned</button>
        </div>
      </div>

      <div style={panel}>
        <SectionLabel>Or use WhatsApp Cloud API</SectionLabel>
        <Field label="Business phone number">
          <input value={draft.phoneNumber ?? ""} onChange={(e) => setDraft({ ...draft, phoneNumber: e.target.value })} placeholder="+92 300 0000000" style={input} />
        </Field>
        <Field label="API access token">
          <input value={draft.credentials ?? ""} onChange={(e) => setDraft({ ...draft, credentials: e.target.value })} placeholder="EAAG…" style={input} />
        </Field>
        <Field label="Notes">
          <textarea value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} style={{ ...input, resize: "vertical" }} />
        </Field>
        <button onClick={save} style={btnPrimary}><Save size={13}/> Save</button>
      </div>
    </div>
  );
}

function TelegramSetup({ ch }: { ch: Channel }) {
  const { draft, setDraft, save } = useField<Partial<Channel>>(ch);
  return (
    <div style={panel}>
      <SectionLabel>Bot token from @BotFather</SectionLabel>
      <Field label="Bot token"><input value={draft.botToken ?? ""} onChange={(e) => setDraft({ ...draft, botToken: e.target.value })} placeholder="123456:AA…" style={input} /></Field>
      <Field label="Bot username (optional)"><input value={draft.credentials ?? ""} onChange={(e) => setDraft({ ...draft, credentials: e.target.value })} placeholder="@my_bot" style={input} /></Field>
      <button onClick={save} style={btnPrimary}><Save size={13}/> Save</button>
    </div>
  );
}

function DiscordSetup({ ch }: { ch: Channel }) {
  const { draft, setDraft, save } = useField<Partial<Channel>>(ch);
  return (
    <div style={panel}>
      <SectionLabel>Discord connection</SectionLabel>
      <Field label="Bot token (for full bot)"><input value={draft.botToken ?? ""} onChange={(e) => setDraft({ ...draft, botToken: e.target.value })} style={input} /></Field>
      <Field label="Or incoming webhook URL"><input value={draft.webhookUrl ?? ""} onChange={(e) => setDraft({ ...draft, webhookUrl: e.target.value })} placeholder="https://discord.com/api/webhooks/…" style={input} /></Field>
      <button onClick={save} style={btnPrimary}><Save size={13}/> Save</button>
    </div>
  );
}

function SlackSetup({ ch }: { ch: Channel }) {
  const { draft, setDraft, save } = useField<Partial<Channel>>(ch);
  return (
    <div style={panel}>
      <SectionLabel>Slack incoming webhook</SectionLabel>
      <Field label="Webhook URL"><input value={draft.webhookUrl ?? ""} onChange={(e) => setDraft({ ...draft, webhookUrl: e.target.value })} placeholder="https://hooks.slack.com/services/…" style={input} /></Field>
      <button onClick={save} style={btnPrimary}><Save size={13}/> Save</button>
    </div>
  );
}

function EmailSetup({ ch }: { ch: Channel }) {
  const { draft, setDraft, save } = useField<Partial<Channel>>(ch);
  const cfg = (() => { try { return JSON.parse(draft.config || "{}"); } catch { return {}; } })();
  const setCfg = (k: string, v: string) => setDraft({ ...draft, config: JSON.stringify({ ...cfg, [k]: v }) });
  return (
    <div style={panel}>
      <SectionLabel>SMTP / IMAP</SectionLabel>
      <Field label="Email address"><input value={cfg.email || ""} onChange={(e) => setCfg("email", e.target.value)} style={input} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="SMTP host"><input value={cfg.smtpHost || ""} onChange={(e) => setCfg("smtpHost", e.target.value)} placeholder="smtp.gmail.com" style={input} /></Field>
        <Field label="SMTP port"><input value={cfg.smtpPort || ""} onChange={(e) => setCfg("smtpPort", e.target.value)} placeholder="587" style={input} /></Field>
      </div>
      <Field label="Password / app key"><input type="password" value={draft.credentials ?? ""} onChange={(e) => setDraft({ ...draft, credentials: e.target.value })} style={input} /></Field>
      <button onClick={save} style={btnPrimary}><Save size={13}/> Save</button>
    </div>
  );
}

function SmsSetup({ ch }: { ch: Channel }) {
  const { draft, setDraft, save } = useField<Partial<Channel>>(ch);
  return (
    <div style={panel}>
      <SectionLabel>SMS provider (Twilio / others)</SectionLabel>
      <Field label="From number"><input value={draft.phoneNumber ?? ""} onChange={(e) => setDraft({ ...draft, phoneNumber: e.target.value })} placeholder="+1 555…" style={input} /></Field>
      <Field label="Account SID / API key"><input value={draft.credentials ?? ""} onChange={(e) => setDraft({ ...draft, credentials: e.target.value })} style={input} /></Field>
      <button onClick={save} style={btnPrimary}><Save size={13}/> Save</button>
    </div>
  );
}

function WebSetup({ ch }: { ch: Channel }) {
  const snippet = `<script src="https://cdn.digi.os/chat.js" data-channel="${ch.id}" async></script>`;
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return (
    <div style={panel}>
      <SectionLabel>Web chat embed</SectionLabel>
      <div style={{ padding: 12, borderRadius: 8, background: "#0A0C12", border: "1px solid #1F232C", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#C8CCD4", overflowX: "auto" }}>
        {snippet}
      </div>
      <button onClick={copy} style={{ ...btnPrimary, marginTop: 12 }}>{copied ? <Check size={13}/> : <Copy size={13}/>} {copied ? "Copied" : "Copy snippet"}</button>
    </div>
  );
}

function WebhookSetup({ ch }: { ch: Channel }) {
  const { draft, setDraft, save } = useField<Partial<Channel>>(ch);
  return (
    <div style={panel}>
      <SectionLabel>Generic webhook</SectionLabel>
      <Field label="Outbound webhook URL"><input value={draft.webhookUrl ?? ""} onChange={(e) => setDraft({ ...draft, webhookUrl: e.target.value })} style={input} /></Field>
      <Field label="Signing secret"><input value={draft.credentials ?? ""} onChange={(e) => setDraft({ ...draft, credentials: e.target.value })} style={input} /></Field>
      <button onClick={save} style={btnPrimary}><Save size={13}/> Save</button>
    </div>
  );
}

function CustomSetup({ ch }: { ch: Channel }) {
  const { draft, setDraft, save } = useField<Partial<Channel>>(ch);
  return (
    <div style={panel}>
      <SectionLabel>Custom channel configuration</SectionLabel>
      <div style={{ fontSize: 11.5, color: "#8A909C", marginBottom: 10 }}>
        Free-form JSON config. Wire this to any private bot, API, or protocol from the backend.
      </div>
      <Field label="Endpoint / target"><input value={draft.webhookUrl ?? ""} onChange={(e) => setDraft({ ...draft, webhookUrl: e.target.value })} placeholder="https://…" style={input} /></Field>
      <Field label="Credentials / token"><input value={draft.credentials ?? ""} onChange={(e) => setDraft({ ...draft, credentials: e.target.value })} style={input} /></Field>
      <Field label="Config (JSON)">
        <textarea value={draft.config ?? ""} onChange={(e) => setDraft({ ...draft, config: e.target.value })} rows={8} style={{ ...input, resize: "vertical", fontFamily: "'JetBrains Mono', monospace" }} />
      </Field>
      <button onClick={save} style={btnPrimary}><Save size={13}/> Save</button>
    </div>
  );
}

// ─── Webhooks / Automation / Logs ──────────────────────────
function WebhooksTab({ ch }: { ch: Channel }) {
  const inbound = `https://project--84dc44e5-3087-42bc-a5fc-a953c73b0ad8-dev.lovable.app/api/public/channels/${ch.id}/inbound`;
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(inbound); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return (
    <div style={panel}>
      <SectionLabel>Inbound webhook URL</SectionLabel>
      <div style={{ padding: 10, borderRadius: 8, background: "#0A0C12", border: "1px solid #1F232C", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#C8CCD4", overflowX: "auto" }}>{inbound}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={copy} style={btnPrimary}>{copied ? <Check size={13}/> : <Copy size={13}/>} {copied ? "Copied" : "Copy URL"}</button>
      </div>
      <div style={{ fontSize: 11.5, color: "#8A909C", marginTop: 14, lineHeight: 1.55 }}>
        Backend handler for this URL will be added under <code>/api/public/channels/*</code>. Point external providers here once available.
      </div>
    </div>
  );
}

function AutomationTab({ ch }: { ch: Channel }) {
  return (
    <div style={panel}>
      <SectionLabel>Channel automation</SectionLabel>
      <div style={{ fontSize: 12.5, color: "#8A909C", lineHeight: 1.6 }}>
        Bind agents, workflows, and skills to messages received on <b style={{ color: "#F5F6F8" }}>{ch.name}</b>.
        Wiring lives here; execution runs through the Agent / Workflow layer.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
        <Link to="/agents" style={btnGhost}>Bind an agent →</Link>
        <Link to="/workflows" style={btnGhost}>Attach a workflow →</Link>
      </div>
    </div>
  );
}

function LogsTab({ ch: _ch }: { ch: Channel }) {
  return (
    <div style={panel}>
      <SectionLabel>Recent traffic</SectionLabel>
      <div style={{ padding: 24, border: "1px dashed #1F232C", borderRadius: 10, textAlign: "center", color: "#5C616B", fontSize: 12.5 }}>
        No messages logged yet. Backend log stream will render here.
      </div>
    </div>
  );
}

// ─── shared field / styles ─────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "#8A909C", textTransform: "uppercase", marginBottom: 5, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      {children}
    </label>
  );
}

const panel: React.CSSProperties = {
  padding: 16, borderRadius: 10, border: "1px solid #1A1D24",
  background: "rgba(255,255,255,0.02)",
};
const input: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: 8,
  background: "rgba(255,255,255,0.03)", border: "1px solid #1F232C",
  color: "#F5F6F8", fontSize: 12.5, outline: "none",
};
