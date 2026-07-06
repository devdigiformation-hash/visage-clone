import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  integrationsRepo, INTEGRATION_CATEGORIES,
  type Integration, type IntegrationCategory, type IntegrationConnectionMethod, type IntegrationStatus,
} from "@/lib/repo";
import {
  ArrowLeft, Trash2, Power, RefreshCw, CheckCircle2, XCircle, Save, PlayCircle,
} from "lucide-react";
import {
  btnGhost, btnPrimary, btnDanger, SectionLabel, categoryIcon, findTemplate, statusColor,
} from "@/routes/integrations";

export const Route = createFileRoute("/integrations/$integrationId")({
  head: ({ params }) => ({ meta: [{ title: `Integration · ${params.integrationId} · Digi Business OS` }] }),
  component: IntegrationDetail,
});

function IntegrationDetail() {
  const { integrationId } = Route.useParams();
  const nav = useNavigate();

  const [item, setItem] = useState<Integration | undefined>(() => integrationsRepo.get(integrationId));
  const [tab, setTab] = useState<"config" | "webhooks" | "automation" | "logs">("config");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    const unsub = integrationsRepo.subscribe(() => setItem(integrationsRepo.get(integrationId)));
    return () => { unsub(); };
  }, [integrationId]);

  const tpl = useMemo(() => findTemplate(item?.templateId), [item?.templateId]);
  if (!item) {
    return (
      <div>
        <Link to="/integrations" style={btnGhost}><ArrowLeft size={13} /> Back</Link>
        <div style={{ marginTop: 24, padding: 20, borderRadius: 10, border: "1px dashed #1F232C", color: "#8A909C", fontSize: 13 }}>
          Integration not found.
        </div>
      </div>
    );
  }
  const color = tpl?.color ?? "#F5A623";

  const patch = (p: Partial<Integration>) => {
    integrationsRepo.update(item.id, p);
  };
  const set = (k: keyof Integration, v: any) => patch({ [k]: v } as any);

  const save = () => {
    setSaveState("saving");
    setTimeout(() => { setSaveState("saved"); setTimeout(() => setSaveState("idle"), 1200); }, 300);
  };
  const connect = () => patch({ status: "connected", active: true, lastConnectedAt: Date.now() });
  const disconnect = () => patch({ status: "disconnected", active: false });
  const reconnect = () => { patch({ status: "pending" }); setTimeout(() => patch({ status: "connected", lastConnectedAt: Date.now() }), 700); };
  const test = () => { patch({ status: "pending" }); setTimeout(() => patch({ status: "connected", lastConnectedAt: Date.now() }), 700); };
  const remove = () => { if (confirm(`Delete "${item.name}"?`)) { integrationsRepo.remove(item.id); nav({ to: "/integrations" }); } };

  return (
    <div>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <Link to="/integrations" style={btnGhost}><ArrowLeft size={13} /> Back</Link>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}55`, display: "grid", placeItems: "center", flexShrink: 0 }}>
            {categoryIcon(item.category, 18, color)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
            <div style={{ fontSize: 11.5, color: "#8A909C", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
              {item.category} · {item.method} · <span style={{ color: statusColor(item.status) }}>{item.status}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={test} style={btnGhost}><PlayCircle size={13} /> Test</button>
          {item.status === "connected"
            ? <button onClick={reconnect} style={btnGhost}><RefreshCw size={13} /> Reconnect</button>
            : <button onClick={connect} style={btnPrimary}><CheckCircle2 size={13} /> Connect</button>}
          {item.status === "connected" && <button onClick={disconnect} style={btnGhost}><Power size={13} /> Disconnect</button>}
          <button onClick={remove} style={btnDanger}><Trash2 size={13} /> Delete</button>
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1A1D24", marginBottom: 16 }}>
        {(["config","webhooks","automation","logs"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "8px 14px", background: "transparent", border: 0, cursor: "pointer",
              fontSize: 12, fontWeight: 500, textTransform: "capitalize",
              color: tab === t ? "#F5F6F8" : "#8A909C",
              borderBottom: tab === t ? `2px solid ${color}` : "2px solid transparent",
            }}>{t}</button>
        ))}
      </div>

      {tab === "config" && (
        <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
          <div style={panel}>
            <SectionLabel>Basics</SectionLabel>
            <Field label="Name"><input value={item.name} onChange={(e) => set("name", e.target.value)} style={input} /></Field>
            <Field label="Provider"><input value={item.provider ?? ""} onChange={(e) => set("provider", e.target.value)} style={input} /></Field>
            <Row>
              <Field label="Category">
                <select value={item.category as string} onChange={(e) => set("category", e.target.value as IntegrationCategory)} style={input}>
                  {INTEGRATION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Method">
                <select value={item.method} onChange={(e) => set("method", e.target.value as IntegrationConnectionMethod)} style={input}>
                  <option value="api_key">API Key</option>
                  <option value="oauth">OAuth</option>
                  <option value="webhook">Webhook</option>
                  <option value="smtp">SMTP</option>
                  <option value="browser">Browser</option>
                  <option value="custom">Custom</option>
                </select>
              </Field>
            </Row>
            <Field label="Description">
              <textarea value={item.description ?? ""} onChange={(e) => set("description", e.target.value)} style={{ ...input, minHeight: 60 }} />
            </Field>
          </div>

          <div style={panel}>
            <SectionLabel>Credentials & endpoint</SectionLabel>
            {item.method === "api_key" && (
              <>
                <Field label="API key"><input value={item.apiKey ?? ""} onChange={(e) => set("apiKey", e.target.value)} style={input} /></Field>
                <Field label="Endpoint"><input value={item.endpoint ?? ""} onChange={(e) => set("endpoint", e.target.value)} style={input} /></Field>
              </>
            )}
            {item.method === "oauth" && (
              <Row>
                <Field label="Client ID"><input value={item.clientId ?? ""} onChange={(e) => set("clientId", e.target.value)} style={input} /></Field>
                <Field label="Client Secret"><input value={item.clientSecret ?? ""} onChange={(e) => set("clientSecret", e.target.value)} style={input} /></Field>
              </Row>
            )}
            {item.method === "webhook" && (
              <>
                <Field label="Webhook URL"><input value={item.webhookUrl ?? ""} onChange={(e) => set("webhookUrl", e.target.value)} style={input} /></Field>
                <Field label="Signing secret"><input value={item.webhookSecret ?? ""} onChange={(e) => set("webhookSecret", e.target.value)} style={input} /></Field>
              </>
            )}
            {item.method === "smtp" && (
              <>
                <Row>
                  <Field label="Host"><input value={item.smtpHost ?? ""} onChange={(e) => set("smtpHost", e.target.value)} style={input} /></Field>
                  <Field label="Port"><input value={item.smtpPort ?? ""} onChange={(e) => set("smtpPort", e.target.value)} style={input} /></Field>
                </Row>
                <Row>
                  <Field label="Username"><input value={item.smtpUser ?? ""} onChange={(e) => set("smtpUser", e.target.value)} style={input} /></Field>
                  <Field label="Password"><input value={item.smtpPass ?? ""} onChange={(e) => set("smtpPass", e.target.value)} style={input} type="password" /></Field>
                </Row>
              </>
            )}
            {item.method === "browser" && (
              <Field label="Browser profile / binding"><input value={item.browserProfile ?? ""} onChange={(e) => set("browserProfile", e.target.value)} style={input} /></Field>
            )}
            {item.method === "custom" && (
              <Field label="Config (JSON or free-form)">
                <textarea value={item.config ?? ""} onChange={(e) => set("config", e.target.value)} style={{ ...input, minHeight: 160, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }} />
              </Field>
            )}
          </div>

          <div style={panel}>
            <SectionLabel>Metadata</SectionLabel>
            <Field label="Tags"><input value={item.tags ?? ""} onChange={(e) => set("tags", e.target.value)} style={input} /></Field>
            <Field label="Notes"><textarea value={item.notes ?? ""} onChange={(e) => set("notes", e.target.value)} style={{ ...input, minHeight: 80 }} /></Field>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={save} style={btnPrimary}>
              {saveState === "saved" ? <><CheckCircle2 size={13} /> Saved</> : <><Save size={13} /> {saveState === "saving" ? "Saving…" : "Save changes"}</>}
            </button>
          </div>
        </div>
      )}

      {tab === "webhooks" && (
        <div style={{ ...panel, maxWidth: 720 }}>
          <SectionLabel>Inbound webhook</SectionLabel>
          <Field label="Callback URL (backend will provide)">
            <input value={`https://api.digi-os.app/hooks/${item.id}`} readOnly style={{ ...input, opacity: 0.7 }} />
          </Field>
          <Field label="Verify secret"><input value={item.webhookSecret ?? ""} onChange={(e) => set("webhookSecret", e.target.value)} style={input} placeholder="whsec_…" /></Field>
          <div style={{ fontSize: 11.5, color: "#8A909C", marginTop: 8 }}>
            When backend is attached, this integration can send/receive events at the URL above.
          </div>
        </div>
      )}

      {tab === "automation" && (
        <div style={{ ...panel, maxWidth: 720 }}>
          <SectionLabel>Bind to</SectionLabel>
          <div style={{ fontSize: 12, color: "#A0A6B2", lineHeight: 1.6 }}>
            This integration will be selectable inside Agents, Tools, Workflows, Bots and Channels
            once wired. Bindings appear here.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <Link to="/agents" style={btnGhost}>Agents →</Link>
            <Link to="/tools" style={btnGhost}>Tools →</Link>
            <Link to="/workflows" style={btnGhost}>Workflows →</Link>
            <Link to="/bots" style={btnGhost}>Bots →</Link>
            <Link to="/channels" style={btnGhost}>Channels →</Link>
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div style={{ ...panel, maxWidth: 720 }}>
          <SectionLabel>Recent activity</SectionLabel>
          <div style={{ fontSize: 12, color: "#8A909C" }}>
            No activity yet. Connection events, requests, and errors will stream here once backend is attached.
          </div>
        </div>
      )}
    </div>
  );
}

// styles
const panel: React.CSSProperties = {
  padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)",
  border: "1px solid #1A1D24",
};
const input: React.CSSProperties = {
  width: "100%", padding: "8px 10px", background: "rgba(255,255,255,0.03)",
  border: "1px solid #1F232C", borderRadius: 8, color: "#F5F6F8", fontSize: 12.5,
  outline: "none", fontFamily: "inherit",
};
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.14em", color: "#5C616B", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
}
