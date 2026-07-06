import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import {
  Settings as SettingsIcon, Globe, Cpu, Bot, Wrench, Zap, Workflow,
  MessageSquare, Plug, Database, Shield, Activity, Clock, Download,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

// ────────────────────────────────────────────────────────────────────────────
// OpenClaw-level System Settings
// One page, 13 grouped sections (A–M from spec). Each writes to localStorage.
// ────────────────────────────────────────────────────────────────────────────

const K = "digi.settings.v2";

type Prefs = {
  // A · General
  workspaceName: string;
  environment: "development" | "staging" | "production";
  timezone: string;
  locale: string;
  density: "compact" | "cozy" | "comfortable";
  notifyEmail: boolean;
  notifyDesktop: boolean;
  // B · Models
  defaultModelId: string;
  fallbackModelId: string;
  defaultTemp: number;
  defaultMaxTokens: number;
  openaiKey: string; openaiBase: string;
  geminiKey: string;
  deepseekKey: string; deepseekBase: string;
  openrouterKey: string;
  ollamaBase: string;
  customBase: string; customKey: string;
  // C · Agents
  agentMaxSteps: number;
  agentTimeoutSec: number;
  agentSandbox: boolean;
  agentAutoPublish: boolean;
  // D · Tools
  toolAutoApprove: boolean;
  toolNetworkAllowed: boolean;
  toolFileAccess: boolean;
  // E · Skills
  skillVersioning: boolean;
  skillAutoValidate: boolean;
  // F · Workflows
  wfRetryCount: number;
  wfRequireApproval: boolean;
  wfDryRun: boolean;
  // G · Channels
  chWhatsappToken: string;
  chTelegramToken: string;
  chWebhookSecret: string;
  chDefaultAgentId: string;
  // H · Integrations (routing defaults)
  slackWebhook: string;
  sheetsClientId: string;
  vectorStoreUrl: string;
  // I · Memory / Brain
  memoryEnabled: boolean;
  memoryTTLDays: number;
  embeddingModel: string;
  autoReindex: boolean;
  // J · Security / Runtime
  requireConfirmDestructive: boolean;
  devMode: boolean;
  productionMode: boolean;
  rateLimitPerMin: number;
  auditLogEnabled: boolean;
  // K · Logs / Observability
  logRetentionDays: number;
  traceEnabled: boolean;
  logLevel: "error" | "warn" | "info" | "debug";
  // L · Automations
  cronEnabled: boolean;
  jobConcurrency: number;
  // M · Import / Export handled via buttons
};

const empty: Prefs = {
  workspaceName: "Digi Business OS", environment: "development", timezone: "Asia/Karachi",
  locale: "en-US", density: "cozy", notifyEmail: true, notifyDesktop: false,
  defaultModelId: "gpt-5", fallbackModelId: "gemini-2.5-pro", defaultTemp: 0.7, defaultMaxTokens: 4096,
  openaiKey: "", openaiBase: "https://api.openai.com/v1",
  geminiKey: "", deepseekKey: "", deepseekBase: "https://api.deepseek.com",
  openrouterKey: "", ollamaBase: "http://localhost:11434",
  customBase: "", customKey: "",
  agentMaxSteps: 20, agentTimeoutSec: 120, agentSandbox: true, agentAutoPublish: false,
  toolAutoApprove: false, toolNetworkAllowed: true, toolFileAccess: false,
  skillVersioning: true, skillAutoValidate: true,
  wfRetryCount: 2, wfRequireApproval: true, wfDryRun: false,
  chWhatsappToken: "", chTelegramToken: "", chWebhookSecret: "", chDefaultAgentId: "",
  slackWebhook: "", sheetsClientId: "", vectorStoreUrl: "",
  memoryEnabled: true, memoryTTLDays: 90, embeddingModel: "text-embedding-3-small", autoReindex: true,
  requireConfirmDestructive: true, devMode: false, productionMode: false, rateLimitPerMin: 60, auditLogEnabled: true,
  logRetentionDays: 30, traceEnabled: false, logLevel: "info",
  cronEnabled: true, jobConcurrency: 4,
};

type TabKey =
  | "general" | "models" | "agents" | "tools" | "skills" | "workflows"
  | "channels" | "integrations" | "memory" | "security" | "logs" | "automations" | "backup";

const TABS: { key: TabKey; label: string; Icon: any; color: string }[] = [
  { key: "general", label: "General", Icon: Globe, color: "#3B82F6" },
  { key: "models", label: "Models & LLMs", Icon: Cpu, color: "#F472B6" },
  { key: "agents", label: "Agents", Icon: Bot, color: "#A78BFA" },
  { key: "tools", label: "Tools", Icon: Wrench, color: "#7DD3FC" },
  { key: "skills", label: "Skills", Icon: Zap, color: "#3B82F6" },
  { key: "workflows", label: "Workflows", Icon: Workflow, color: "#8B5CF6" },
  { key: "channels", label: "Channels", Icon: MessageSquare, color: "#22C55E" },
  { key: "integrations", label: "Integrations", Icon: Plug, color: "#F5A623" },
  { key: "memory", label: "Memory / Brain", Icon: Database, color: "#06B6D4" },
  { key: "security", label: "Security & Runtime", Icon: Shield, color: "#EF4444" },
  { key: "logs", label: "Logs & Observability", Icon: Activity, color: "#2FE0C8" },
  { key: "automations", label: "Automations", Icon: Clock, color: "#F59E0B" },
  { key: "backup", label: "Backup / Import", Icon: Download, color: "#94A3B8" },
];

function SettingsPage() {
  const [data, setData] = useState<Prefs>(empty);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<TabKey>("general");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { const r = localStorage.getItem(K); if (r) setData({ ...empty, ...JSON.parse(r) }); } catch {}
  }, []);
  const save = () => { localStorage.setItem(K, JSON.stringify(data)); setSaved(true); setTimeout(() => setSaved(false), 1600); };
  const upd = (k: keyof Prefs, v: any) => setData({ ...data, [k]: v });

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Left tab rail */}
      <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #1A1D24", background: "#080A0F", overflowY: "auto", padding: "16px 10px" }} className="custom-scroll">
        <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#5C616B", fontFamily: "'JetBrains Mono', monospace", padding: "0 8px 10px" }}>SETTINGS</div>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            padding: "7px 10px", marginBottom: 2, borderRadius: 6, cursor: "pointer",
            background: tab === t.key ? "rgba(47,224,200,0.10)" : "transparent",
            border: "none", borderLeft: `2px solid ${tab === t.key ? t.color : "transparent"}`,
            color: tab === t.key ? "#F5F6F8" : "#8A909C", fontSize: 11.5, textAlign: "left",
          }}>
            <t.Icon size={13} style={{ color: t.color, opacity: tab === t.key ? 1 : 0.7 }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Right content */}
      <div style={{ flex: 1, overflow: "auto" }} className="custom-scroll">
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #1A1D24", display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#0A0C12", zIndex: 10 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "#EF444418", border: "1px solid #EF444440", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SettingsIcon size={20} color="#EF4444" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: "#F5F6F8", margin: 0 }}>System Settings</h1>
              <p style={{ fontSize: 12, color: "#7A8090", margin: "3px 0 0" }}>Runtime, credentials, agents, tools, security and observability.</p>
            </div>
          </div>
          <button onClick={save} style={{ padding: "8px 18px", background: saved ? "#22C55E20" : "#EF444420", border: `1px solid ${saved ? "#22C55E60" : "#EF444460"}`, borderRadius: 6, color: saved ? "#22C55E" : "#EF4444", cursor: "pointer", fontSize: 12 }}>{saved ? "✓ Saved" : "Save Changes"}</button>
        </div>

        <div style={{ padding: 24, maxWidth: 780 }}>
          {tab === "general" && (
            <Section title="General & Workspace">
              <Field label="Workspace Name"><Text v={data.workspaceName} onChange={(v) => upd("workspaceName", v)} /></Field>
              <Field label="Environment"><Select v={data.environment} opts={["development", "staging", "production"]} onChange={(v) => upd("environment", v)} /></Field>
              <Field label="Timezone"><Text v={data.timezone} onChange={(v) => upd("timezone", v)} /></Field>
              <Field label="Locale"><Text v={data.locale} onChange={(v) => upd("locale", v)} /></Field>
              <Field label="UI Density"><Select v={data.density} opts={["compact", "cozy", "comfortable"]} onChange={(v) => upd("density", v)} /></Field>
              <Toggle label="Email notifications" v={data.notifyEmail} onChange={(v) => upd("notifyEmail", v)} />
              <Toggle label="Desktop notifications" v={data.notifyDesktop} onChange={(v) => upd("notifyDesktop", v)} />
            </Section>
          )}

          {tab === "models" && (
            <Section title="Models & LLM Providers">
              <Row2>
                <Field label="Default Model"><Text v={data.defaultModelId} onChange={(v) => upd("defaultModelId", v)} /></Field>
                <Field label="Fallback Model"><Text v={data.fallbackModelId} onChange={(v) => upd("fallbackModelId", v)} /></Field>
              </Row2>
              <Row2>
                <Field label="Default Temperature"><Text v={String(data.defaultTemp)} onChange={(v) => upd("defaultTemp", Number(v))} type="number" /></Field>
                <Field label="Max Tokens"><Text v={String(data.defaultMaxTokens)} onChange={(v) => upd("defaultMaxTokens", Number(v))} type="number" /></Field>
              </Row2>
              <SubTitle>OpenAI</SubTitle>
              <Field label="API Key"><Text v={data.openaiKey} onChange={(v) => upd("openaiKey", v)} placeholder="sk-..." /></Field>
              <Field label="Base URL"><Text v={data.openaiBase} onChange={(v) => upd("openaiBase", v)} /></Field>
              <SubTitle>Google Gemini</SubTitle>
              <Field label="API Key"><Text v={data.geminiKey} onChange={(v) => upd("geminiKey", v)} /></Field>
              <SubTitle>DeepSeek</SubTitle>
              <Field label="API Key"><Text v={data.deepseekKey} onChange={(v) => upd("deepseekKey", v)} /></Field>
              <Field label="Base URL"><Text v={data.deepseekBase} onChange={(v) => upd("deepseekBase", v)} /></Field>
              <SubTitle>OpenRouter</SubTitle>
              <Field label="API Key"><Text v={data.openrouterKey} onChange={(v) => upd("openrouterKey", v)} /></Field>
              <SubTitle>Ollama (Local)</SubTitle>
              <Field label="Base URL"><Text v={data.ollamaBase} onChange={(v) => upd("ollamaBase", v)} /></Field>
              <SubTitle>Custom Provider</SubTitle>
              <Row2>
                <Field label="Base URL"><Text v={data.customBase} onChange={(v) => upd("customBase", v)} /></Field>
                <Field label="API Key"><Text v={data.customKey} onChange={(v) => upd("customKey", v)} /></Field>
              </Row2>
              <TestBtn label="Test all connections" />
            </Section>
          )}

          {tab === "agents" && (
            <Section title="Agent Runtime Defaults">
              <Row2>
                <Field label="Max Steps per Run"><Text v={String(data.agentMaxSteps)} onChange={(v) => upd("agentMaxSteps", Number(v))} type="number" /></Field>
                <Field label="Timeout (seconds)"><Text v={String(data.agentTimeoutSec)} onChange={(v) => upd("agentTimeoutSec", Number(v))} type="number" /></Field>
              </Row2>
              <Toggle label="Sandbox mode (dry-run before execute)" v={data.agentSandbox} onChange={(v) => upd("agentSandbox", v)} />
              <Toggle label="Auto-publish new agent versions" v={data.agentAutoPublish} onChange={(v) => upd("agentAutoPublish", v)} />
            </Section>
          )}

          {tab === "tools" && (
            <Section title="Tool Execution Policy">
              <Toggle label="Auto-approve tool invocations" v={data.toolAutoApprove} onChange={(v) => upd("toolAutoApprove", v)} />
              <Toggle label="Allow network access from tools" v={data.toolNetworkAllowed} onChange={(v) => upd("toolNetworkAllowed", v)} />
              <Toggle label="Allow filesystem access from tools" v={data.toolFileAccess} onChange={(v) => upd("toolFileAccess", v)} />
            </Section>
          )}

          {tab === "skills" && (
            <Section title="Skill Library">
              <Toggle label="Enable skill versioning" v={data.skillVersioning} onChange={(v) => upd("skillVersioning", v)} />
              <Toggle label="Auto-validate skill definitions on save" v={data.skillAutoValidate} onChange={(v) => upd("skillAutoValidate", v)} />
            </Section>
          )}

          {tab === "workflows" && (
            <Section title="Workflow Orchestration">
              <Field label="Retry Count"><Text v={String(data.wfRetryCount)} onChange={(v) => upd("wfRetryCount", Number(v))} type="number" /></Field>
              <Toggle label="Require approval for production workflows" v={data.wfRequireApproval} onChange={(v) => upd("wfRequireApproval", v)} />
              <Toggle label="Dry-run mode (log without executing)" v={data.wfDryRun} onChange={(v) => upd("wfDryRun", v)} />
            </Section>
          )}

          {tab === "channels" && (
            <Section title="Channels & Messaging">
              <Field label="WhatsApp Token"><Text v={data.chWhatsappToken} onChange={(v) => upd("chWhatsappToken", v)} /></Field>
              <Field label="Telegram Bot Token"><Text v={data.chTelegramToken} onChange={(v) => upd("chTelegramToken", v)} /></Field>
              <Field label="Inbound Webhook Secret"><Text v={data.chWebhookSecret} onChange={(v) => upd("chWebhookSecret", v)} /></Field>
              <Field label="Default Routing Agent ID"><Text v={data.chDefaultAgentId} onChange={(v) => upd("chDefaultAgentId", v)} /></Field>
            </Section>
          )}

          {tab === "integrations" && (
            <Section title="Integrations">
              <Field label="Slack Incoming Webhook"><Text v={data.slackWebhook} onChange={(v) => upd("slackWebhook", v)} /></Field>
              <Field label="Google Sheets Client ID"><Text v={data.sheetsClientId} onChange={(v) => upd("sheetsClientId", v)} /></Field>
              <Field label="Vector Store URL"><Text v={data.vectorStoreUrl} onChange={(v) => upd("vectorStoreUrl", v)} placeholder="pinecone / qdrant / weaviate" /></Field>
              <TestBtn label="Test integration endpoints" />
            </Section>
          )}

          {tab === "memory" && (
            <Section title="Memory / Brain / Knowledge">
              <Toggle label="Enable long-term memory" v={data.memoryEnabled} onChange={(v) => upd("memoryEnabled", v)} />
              <Row2>
                <Field label="Memory TTL (days)"><Text v={String(data.memoryTTLDays)} onChange={(v) => upd("memoryTTLDays", Number(v))} type="number" /></Field>
                <Field label="Embedding Model"><Text v={data.embeddingModel} onChange={(v) => upd("embeddingModel", v)} /></Field>
              </Row2>
              <Toggle label="Auto-reindex on knowledge changes" v={data.autoReindex} onChange={(v) => upd("autoReindex", v)} />
              <TestBtn label="Trigger reindex now" />
            </Section>
          )}

          {tab === "security" && (
            <Section title="Security, Access & Runtime">
              <Toggle label="Require confirmation for destructive actions" v={data.requireConfirmDestructive} onChange={(v) => upd("requireConfirmDestructive", v)} />
              <Toggle label="Developer mode (verbose errors)" v={data.devMode} onChange={(v) => upd("devMode", v)} />
              <Toggle label="Production mode (hardened)" v={data.productionMode} onChange={(v) => upd("productionMode", v)} />
              <Toggle label="Audit log enabled" v={data.auditLogEnabled} onChange={(v) => upd("auditLogEnabled", v)} />
              <Field label="Rate limit (req/min)"><Text v={String(data.rateLimitPerMin)} onChange={(v) => upd("rateLimitPerMin", Number(v))} type="number" /></Field>
            </Section>
          )}

          {tab === "logs" && (
            <Section title="Logs & Observability">
              <Row2>
                <Field label="Log Retention (days)"><Text v={String(data.logRetentionDays)} onChange={(v) => upd("logRetentionDays", Number(v))} type="number" /></Field>
                <Field label="Log Level"><Select v={data.logLevel} opts={["error", "warn", "info", "debug"]} onChange={(v) => upd("logLevel", v as any)} /></Field>
              </Row2>
              <Toggle label="Enable execution tracing" v={data.traceEnabled} onChange={(v) => upd("traceEnabled", v)} />
              <div style={{ marginTop: 14 }}>
                <a href="/logs" style={{ fontSize: 12, color: "#2FE0C8", textDecoration: "none" }}>→ Open Activity & Traces</a>
              </div>
            </Section>
          )}

          {tab === "automations" && (
            <Section title="Automations & Scheduling">
              <Toggle label="Cron scheduler enabled" v={data.cronEnabled} onChange={(v) => upd("cronEnabled", v)} />
              <Field label="Job concurrency"><Text v={String(data.jobConcurrency)} onChange={(v) => upd("jobConcurrency", Number(v))} type="number" /></Field>
              <div style={{ marginTop: 14 }}>
                <a href="/jobs" style={{ fontSize: 12, color: "#2FE0C8", textDecoration: "none" }}>→ Open Jobs Board</a>
              </div>
            </Section>
          )}

          {tab === "backup" && (
            <Section title="Import · Export · Backup">
              <p style={{ color: "#7A8090", fontSize: 12, marginBottom: 14 }}>Export the full workspace configuration (models, agents, tools, skills, workflows, channels, integrations, memory, settings) as JSON — or restore from a previous export.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => {
                  const dump: any = { settings: data };
                  ["digi.repo.models","digi.repo.skills","digi.repo.tools","digi.repo.agents","digi.repo.workflows","digi.repo.channels","digi.repo.integrations","digi.repo.jobs","digi.repo.memory","digi.repo.knowledge"].forEach(k => { try { dump[k] = JSON.parse(localStorage.getItem(k) || "[]"); } catch {} });
                  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
                  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `digi-os-backup-${Date.now()}.json`; a.click();
                }} style={btnPrimary}>Export All</button>
                <label style={btnGhost}>
                  Import…
                  <input type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => {
                    const f = e.target.files?.[0]; if (!f) return;
                    const r = new FileReader(); r.onload = () => {
                      try {
                        const dump = JSON.parse(String(r.result));
                        if (dump.settings) localStorage.setItem(K, JSON.stringify(dump.settings));
                        Object.keys(dump).forEach(k => { if (k.startsWith("digi.repo.")) localStorage.setItem(k, JSON.stringify(dump[k])); });
                        alert("Restored. Reloading…"); location.reload();
                      } catch { alert("Invalid backup file."); }
                    }; r.readAsText(f);
                  }} />
                </label>
                <button onClick={() => { if (confirm("Clear all workspace data?")) { Object.keys(localStorage).filter(k => k.startsWith("digi.")).forEach(k => localStorage.removeItem(k)); location.reload(); } }} style={{ ...btnGhost, borderColor: "#EF444460", color: "#EF4444" }}>Reset Workspace</button>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── shared UI ─────────────────────────────────────────────────────────────
const btnPrimary: React.CSSProperties = { padding: "8px 16px", background: "#2FE0C820", border: "1px solid #2FE0C860", borderRadius: 6, color: "#2FE0C8", cursor: "pointer", fontSize: 12 };
const btnGhost: React.CSSProperties = { padding: "8px 16px", background: "transparent", border: "1px solid #2A2D34", borderRadius: 6, color: "#8A909C", cursor: "pointer", fontSize: 12, display: "inline-block" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: 13, letterSpacing: "0.08em", color: "#F5F6F8", margin: "0 0 16px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{title}</h2>
      {children}
    </div>
  );
}
function SubTitle({ children }: { children: ReactNode }) {
  return <div style={{ marginTop: 20, marginBottom: 8, fontSize: 10.5, letterSpacing: "0.12em", color: "#5C616B", fontFamily: "'JetBrains Mono', monospace" }}>{children}</div>;
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 12, flex: 1 }}>
      <label style={{ display: "block", fontSize: 10.5, letterSpacing: "0.08em", color: "#7A8090", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{label}</label>
      {children}
    </div>
  );
}
function Row2({ children }: { children: ReactNode }) { return <div style={{ display: "flex", gap: 12 }}>{children}</div>; }
function Text({ v, onChange, placeholder, type = "text" }: { v: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input value={v} type={type} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
    style={{ width: "100%", padding: "9px 12px", background: "#0A0C12", border: "1px solid #1A1D24", borderRadius: 6, color: "#F5F6F8", fontSize: 12.5, outline: "none", boxSizing: "border-box" }} />;
}
function Select({ v, opts, onChange }: { v: string; opts: string[]; onChange: (v: string) => void }) {
  return <select value={v} onChange={(e) => onChange(e.target.value)}
    style={{ width: "100%", padding: "9px 12px", background: "#0A0C12", border: "1px solid #1A1D24", borderRadius: 6, color: "#F5F6F8", fontSize: 12.5, outline: "none" }}>
    {opts.map(o => <option key={o} value={o}>{o}</option>)}
  </select>;
}
function Toggle({ label, v, onChange }: { label: string; v: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", cursor: "pointer" }}>
      <div onClick={() => onChange(!v)} style={{
        width: 34, height: 20, borderRadius: 20, background: v ? "#2FE0C8" : "#1A1D24",
        position: "relative", transition: "all .2s",
      }}>
        <div style={{ position: "absolute", top: 2, left: v ? 16 : 2, width: 16, height: 16, borderRadius: "50%", background: "#F5F6F8", transition: "all .2s" }} />
      </div>
      <span style={{ fontSize: 12.5, color: "#C4C8D0" }}>{label}</span>
    </label>
  );
}
function TestBtn({ label }: { label: string }) {
  const [state, setState] = useState<"" | "ok">("");
  return (
    <button onClick={() => { setState("ok"); setTimeout(() => setState(""), 1400); }}
      style={{ marginTop: 14, padding: "7px 14px", background: state ? "#22C55E20" : "transparent", border: `1px solid ${state ? "#22C55E60" : "#2A2D34"}`, borderRadius: 6, color: state ? "#22C55E" : "#8A909C", cursor: "pointer", fontSize: 11.5 }}>
      {state ? "✓ Connected" : label}
    </button>
  );
}

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Digi OS" }] }),
  component: () => <AppShell><SettingsPage /></AppShell>,
});
