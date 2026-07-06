import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  integrationsRepo, INTEGRATION_CATALOG, INTEGRATION_CATEGORIES,
  type Integration, type IntegrationCategory, type IntegrationConnectionMethod,
} from "@/lib/repo";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import {
  btnGhost, btnPrimary, SectionLabel, categoryIcon, findTemplate,
} from "@/routes/integrations";

type Search = { templateId?: string; custom?: number };

export const Route = createFileRoute("/integrations/new")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    templateId: typeof s.templateId === "string" ? s.templateId : undefined,
    custom: s.custom ? 1 : undefined,
  }),
  head: () => ({ meta: [{ title: "Add Integration · Digi Business OS" }] }),
  component: NewIntegrationPage,
});

function NewIntegrationPage() {
  const nav = useNavigate();
  const { templateId, custom } = Route.useSearch();
  const tpl = findTemplate(templateId);
  const isCustom = !!custom || (!tpl);

  const [form, setForm] = useState<Partial<Integration>>(() => tpl ? {
    name: tpl.name,
    provider: tpl.provider,
    category: tpl.category,
    method: tpl.method,
    templateId: tpl.id,
    source: "catalog",
    status: "disconnected",
    active: false,
  } : {
    name: "",
    provider: "",
    category: "Custom",
    method: "custom",
    source: "custom",
    status: "disconnected",
    active: false,
  });

  const set = (k: keyof Integration, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const canSave = (form.name ?? "").trim().length > 0;

  const submit = (connect: boolean) => {
    if (!canSave) return;
    const created = integrationsRepo.create({
      ...form,
      status: connect ? "pending" : "disconnected",
      active: connect,
      lastConnectedAt: connect ? Date.now() : undefined,
    } as any);
    nav({ to: "/integrations/$integrationId", params: { integrationId: created.id } });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link to="/integrations" style={btnGhost}><ArrowLeft size={13} /> Back</Link>
        <div style={{ fontSize: 13, color: "#8A909C" }}>
          {isCustom ? "Custom integration" : `Connect ${tpl?.name}`}
        </div>
      </div>

      {!templateId && !custom ? (
        <PickerGrid />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 16, maxWidth: 720 }}>
          <div style={panel}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${tpl?.color ?? "#5C616B"}18`, border: `1px solid ${tpl?.color ?? "#5C616B"}55`, display: "grid", placeItems: "center" }}>
                {tpl ? categoryIcon(tpl.category, 20, tpl.color) : <Sparkles size={20} color="#F5A623" />}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{tpl?.name ?? "Custom Integration"}</div>
                <div style={{ fontSize: 11.5, color: "#8A909C" }}>{tpl?.blurb ?? "Any external system with free-form config."}</div>
              </div>
            </div>

            <SectionLabel>Basics</SectionLabel>
            <Field label="Name">
              <input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} style={input} placeholder="e.g. Production OpenAI" />
            </Field>
            <Field label="Provider">
              <input value={form.provider ?? ""} onChange={(e) => set("provider", e.target.value)} style={input} placeholder="Provider / vendor" />
            </Field>
            <Row>
              <Field label="Category">
                <select value={form.category as string} onChange={(e) => set("category", e.target.value as IntegrationCategory)} style={input}>
                  {INTEGRATION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Connection method">
                <select value={form.method} onChange={(e) => set("method", e.target.value as IntegrationConnectionMethod)} style={input}>
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
              <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} style={{ ...input, minHeight: 60 }} placeholder="What this integration is used for…" />
            </Field>

            <MethodFields form={form} set={set} />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
              <button onClick={() => submit(false)} disabled={!canSave} style={{ ...btnGhost, opacity: canSave ? 1 : 0.5 }}>Save draft</button>
              <button onClick={() => submit(true)} disabled={!canSave} style={{ ...btnPrimary, opacity: canSave ? 1 : 0.5 }}>
                <Plus size={13} /> Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PickerGrid() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return INTEGRATION_CATALOG;
    return INTEGRATION_CATALOG.filter((t) => `${t.name} ${t.provider} ${t.category}`.toLowerCase().includes(n));
  }, [q]);
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search catalog…" style={{ ...input, maxWidth: 320, marginBottom: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 10 }}>
        {filtered.map((t) => (
          <Link key={t.id} to="/integrations/new" search={{ templateId: t.id }} style={{ ...panel, display: "block", textDecoration: "none", color: "#F5F6F8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${t.color}18`, border: `1px solid ${t.color}55`, display: "grid", placeItems: "center" }}>
                {categoryIcon(t.category, 16, t.color)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 10.5, color: "#8A909C" }}>{t.category}</div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: "#A0A6B2", marginTop: 8 }}>{t.blurb}</div>
          </Link>
        ))}
        <Link to="/integrations/new" search={{ custom: 1 }} style={{ ...panel, display: "block", textDecoration: "none", color: "#F5F6F8", borderStyle: "dashed" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#5C616B22", border: "1px solid #5C616B55", display: "grid", placeItems: "center" }}>
              <Sparkles size={16} color="#F5A623" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Custom Integration</div>
              <div style={{ fontSize: 10.5, color: "#8A909C" }}>Free-form config</div>
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "#A0A6B2", marginTop: 8 }}>Add any external, internal, or repo-backed system that isn't in the catalog yet.</div>
        </Link>
      </div>
    </div>
  );
}

function MethodFields({ form, set }: { form: Partial<Integration>; set: (k: keyof Integration, v: any) => void }) {
  const m = form.method;
  return (
    <>
      <SectionLabel>Connection</SectionLabel>
      {m === "api_key" && (
        <>
          <Field label="API key"><input value={form.apiKey ?? ""} onChange={(e) => set("apiKey", e.target.value)} style={input} placeholder="sk-…" /></Field>
          <Field label="Endpoint (optional)"><input value={form.endpoint ?? ""} onChange={(e) => set("endpoint", e.target.value)} style={input} placeholder="https://api.example.com" /></Field>
        </>
      )}
      {m === "oauth" && (
        <Row>
          <Field label="Client ID"><input value={form.clientId ?? ""} onChange={(e) => set("clientId", e.target.value)} style={input} /></Field>
          <Field label="Client Secret"><input value={form.clientSecret ?? ""} onChange={(e) => set("clientSecret", e.target.value)} style={input} /></Field>
        </Row>
      )}
      {m === "webhook" && (
        <>
          <Field label="Webhook URL"><input value={form.webhookUrl ?? ""} onChange={(e) => set("webhookUrl", e.target.value)} style={input} placeholder="https://…" /></Field>
          <Field label="Signing secret"><input value={form.webhookSecret ?? ""} onChange={(e) => set("webhookSecret", e.target.value)} style={input} /></Field>
        </>
      )}
      {m === "smtp" && (
        <>
          <Row>
            <Field label="SMTP host"><input value={form.smtpHost ?? ""} onChange={(e) => set("smtpHost", e.target.value)} style={input} placeholder="smtp.example.com" /></Field>
            <Field label="Port"><input value={form.smtpPort ?? ""} onChange={(e) => set("smtpPort", e.target.value)} style={input} placeholder="587" /></Field>
          </Row>
          <Row>
            <Field label="Username"><input value={form.smtpUser ?? ""} onChange={(e) => set("smtpUser", e.target.value)} style={input} /></Field>
            <Field label="Password"><input value={form.smtpPass ?? ""} onChange={(e) => set("smtpPass", e.target.value)} style={input} type="password" /></Field>
          </Row>
        </>
      )}
      {m === "browser" && (
        <Field label="Browser profile / binding"><input value={form.browserProfile ?? ""} onChange={(e) => set("browserProfile", e.target.value)} style={input} placeholder="e.g. chrome-default, playwright-worker" /></Field>
      )}
      {m === "custom" && (
        <Field label="Config (JSON or free-form)">
          <textarea value={form.config ?? ""} onChange={(e) => set("config", e.target.value)} style={{ ...input, minHeight: 140, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }} placeholder='{ "endpoint": "https://…", "token": "…" }' />
        </Field>
      )}
      <Field label="Tags"><input value={form.tags ?? ""} onChange={(e) => set("tags", e.target.value)} style={input} placeholder="prod, primary" /></Field>
      <Field label="Notes"><textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} style={{ ...input, minHeight: 60 }} /></Field>
    </>
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
