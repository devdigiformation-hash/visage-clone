// Generic localStorage-backed repository.
// Swap for Supabase / API later without touching pages.

export type Entity = { id: string; createdAt: number; updatedAt: number } & Record<string, any>;

const K = (name: string) => `digi.repo.${name}`;

function read<T>(name: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(K(name));
    if (!raw) return fallback;
    return JSON.parse(raw) as T[];
  } catch { return fallback; }
}
function write<T>(name: string, items: T[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(K(name), JSON.stringify(items)); } catch {}
}

const listeners = new Map<string, Set<() => void>>();
function notify(name: string) { listeners.get(name)?.forEach((fn) => fn()); }

export function createRepo<T extends Entity>(name: string, seed: Omit<T, "id" | "createdAt" | "updatedAt">[] = []) {
  const ensureSeed = () => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(K(name))) return;
    const now = Date.now();
    const items = seed.map((s, i) => ({ ...s, id: `${name}_${i}_${now}`, createdAt: now, updatedAt: now })) as T[];
    write(name, items);
  };
  return {
    name,
    list(): T[] { ensureSeed(); return read<T>(name, []); },
    get(id: string): T | undefined { return this.list().find((x) => x.id === id); },
    create(data: Partial<T>): T {
      const now = Date.now();
      const item = { ...(data as any), id: `${name}_${now}_${Math.random().toString(36).slice(2, 7)}`, createdAt: now, updatedAt: now } as T;
      const items = this.list(); items.push(item); write(name, items); notify(name);
      return item;
    },
    update(id: string, patch: Partial<T>): T | undefined {
      const items = this.list();
      const idx = items.findIndex((x) => x.id === id);
      if (idx < 0) return undefined;
      items[idx] = { ...items[idx], ...patch, updatedAt: Date.now() };
      write(name, items); notify(name);
      return items[idx];
    },
    remove(id: string) {
      const items = this.list().filter((x) => x.id !== id);
      write(name, items); notify(name);
    },
    bulkImport(rows: Partial<T>[]) { rows.forEach((r) => this.create(r)); },
    subscribe(fn: () => void) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name)!.add(fn);
      return () => listeners.get(name)!.delete(fn);
    },
  };
}

// ─── Entity types ──────────────────────────────────────────────────────────
export interface Model extends Entity { name: string; provider: string; modelId: string; apiKey?: string; baseURL?: string; tags?: string; active: boolean; isDefault?: boolean; notes?: string; }
export interface Skill extends Entity { name: string; category: string; subcategory?: string; type: "prompt" | "tool" | "code" | "automation" | "markdown"; content: string; tags?: string; relatedToolIds?: string; relatedWorkflowIds?: string; knowledgeRefs?: string; active: boolean; }
export interface Tool extends Entity { name: string; category: string; subcategory?: string; type: string; provider?: string; endpoint?: string; config?: string; tags?: string; relatedSkillIds?: string; active: boolean; }
export interface Agent extends Entity { name: string; role: string; category?: string; source?: "custom" | "template" | "imported"; templateId?: string; modelId?: string; toolIds?: string; skillIds?: string; prompt?: string; active: boolean; }
export interface Bot extends Entity {
  name: string;
  purpose: string;
  category: string;                  // e.g. "Support", "Sales", "Research"
  runtime: "agent" | "workflow" | "script" | "external" | "custom";
  source: "custom" | "template" | "imported";
  templateId?: string;
  agentId?: string;
  workflowId?: string;
  channelIds?: string;               // comma-separated
  triggers?: string;                 // e.g. "message,cron,webhook"
  instructions?: string;
  config?: string;                   // JSON blob
  tags?: string;
  active: boolean;
}
export interface Workflow extends Entity { name: string; trigger: string; category?: string; source?: "custom" | "template" | "imported"; templateId?: string; steps?: string; status: "draft" | "active" | "archived"; notes?: string; }
export type ChannelType = "whatsapp" | "telegram" | "discord" | "email" | "sms" | "slack" | "web" | "webhook" | "custom";
export type ChannelStatus = "connected" | "disconnected" | "pending" | "error";
export interface Channel extends Entity {
  name: string;
  type: ChannelType;
  status: ChannelStatus;
  description?: string;
  credentials?: string;
  config?: string;          // JSON string, type-specific
  phoneNumber?: string;     // whatsapp / sms
  botToken?: string;        // telegram / discord bot
  webhookUrl?: string;      // discord / custom / webhook
  agentId?: string;
  active: boolean;
  lastConnectedAt?: number;
  sessionId?: string;       // whatsapp QR session ref
}
export interface Integration extends Entity { name: string; category: string; apiKey?: string; endpoint?: string; status: "connected" | "disconnected" | "error"; notes?: string; }
export type JobStatus = "queued" | "pending" | "running" | "review" | "approved" | "completed" | "failed" | "blocked" | "cancelled";
export interface Job extends Entity { title: string; agent: string; workflowId?: string; type?: string; status: JobStatus; step: number; totalSteps: number; notes?: string; startedAt?: number; completedAt?: number; durationMs?: number; module?: string; }
export interface MemoryItem extends Entity { title: string; scope: "user" | "system" | "project"; content: string; tags?: string; }
export interface KnowledgePack extends Entity { name: string; source: string; itemCount: number; notes?: string; }
export interface KnowledgeItem extends Entity {
  title: string;
  category: string;
  subcategory?: string;
  format: "markdown" | "snippet" | "reference" | "sop" | "prompt" | "link";
  content: string;
  source?: string;
  tags?: string;
  active: boolean;
}
export interface Workspace extends Entity {
  name: string;
  path: string;
  category: "repo" | "skills" | "tools" | "workflows" | "assets" | "client" | "other";
  tags?: string;
  ignore?: string;
  active: boolean;
  notes?: string;
}
export interface CommandRun extends Entity {
  workspaceId?: string;
  cwd?: string;
  command: string;
  status: "queued" | "running" | "success" | "failed";
  exitCode?: number;
  output?: string;
}
export interface FileOp extends Entity {
  workspaceId?: string;
  op: "create" | "edit" | "move" | "copy" | "delete" | "rename" | "scan";
  target: string;
  detail?: string;
  status: "pending" | "done" | "failed";
}

// ─── Seeds ─────────────────────────────────────────────────────────────────
export const modelsRepo = createRepo<Model>("models", [
  { name: "GPT-5", provider: "OpenAI", modelId: "gpt-5", tags: "cloud,premium", active: true, isDefault: true },
  { name: "Gemini 2.5 Pro", provider: "Google", modelId: "gemini-2.5-pro", tags: "cloud", active: true },
  { name: "DeepSeek Chat", provider: "DeepSeek", modelId: "deepseek-chat", tags: "cloud,cheap", active: true },
  { name: "Llama 3.1 8B", provider: "Ollama", modelId: "llama3.1:8b", baseURL: "http://localhost:11434", tags: "local,free", active: false },
]);
export const skillsRepo = createRepo<Skill>("skills", [
  { name: "Summarize Text", category: "Writing", subcategory: "Summarization", type: "prompt", content: "You are an expert summarizer...", tags: "writing", active: true },
  { name: "Translate to Urdu", category: "Language", subcategory: "Translation", type: "prompt", content: "Translate the following to fluent Urdu...", tags: "language", active: true },
  { name: "Extract Invoice Data", category: "Document / OCR", subcategory: "Extraction", type: "tool", content: "Extract structured invoice fields.", tags: "finance,extract", active: true },
  { name: "Scan Repo Structure", category: "Coding", subcategory: "Repo Analysis", type: "code", content: "Walk workspace and classify files.", tags: "code,repo", active: true },
  { name: "Fill Web Form", category: "Browser", subcategory: "Form Automation", type: "automation", content: "Detect fields and populate.", tags: "browser", active: true },
]);
export const toolsRepo = createRepo<Tool>("tools", [
  { name: "Web Search", category: "Browser", subcategory: "Search", type: "api", provider: "Serper", endpoint: "https://api.serper.dev/search", active: true },
  { name: "Send Email", category: "Messaging", subcategory: "Email", type: "api", provider: "Resend", active: true },
  { name: "File Reader", category: "File / Workspace", subcategory: "IO", type: "local", active: true },
  { name: "Terminal Exec", category: "Terminal", subcategory: "Shell", type: "local", active: false },
  { name: "Git Ops", category: "Coding / Dev", subcategory: "Repo", type: "local", active: false },
]);
export const agentsRepo = createRepo<Agent>("agents", [
  { name: "Sales Agent", role: "Handles inbound leads and quotes", active: true },
  { name: "Support Agent", role: "First-line customer support", active: true },
  { name: "Marketing Agent", role: "Content, campaigns, social", active: true },
  { name: "Finance Agent", role: "Invoices, reconciliation, reports", active: true },
]);
export const workflowsRepo = createRepo<Workflow>("workflows", [
  { name: "Onboard New Customer", trigger: "manual", status: "active" },
  { name: "Weekly Sales Report", trigger: "schedule", status: "active" },
]);
export const channelsRepo = createRepo<Channel>("channels", [
  { name: "Support WhatsApp", type: "whatsapp", status: "disconnected", active: false, description: "Primary customer support line" },
  { name: "Sales Email", type: "email", status: "disconnected", active: false, description: "Inbound sales inbox" },
]);
export const CHANNEL_CATALOG: Array<{ type: ChannelType; label: string; color: string; blurb: string; setupMethod: string; }> = [
  { type: "whatsapp", label: "WhatsApp", color: "#22C55E", blurb: "QR based session or Business Cloud API", setupMethod: "QR / Cloud API" },
  { type: "telegram", label: "Telegram", color: "#3B82F6", blurb: "Bot token via @BotFather", setupMethod: "Bot Token" },
  { type: "discord", label: "Discord", color: "#7C3AED", blurb: "Bot token + guild, or webhook URL", setupMethod: "Bot / Webhook" },
  { type: "slack", label: "Slack", color: "#F59E0B", blurb: "Incoming webhook or Slack app", setupMethod: "Webhook / App" },
  { type: "email", label: "Email", color: "#EC4899", blurb: "SMTP / IMAP mailbox", setupMethod: "SMTP + IMAP" },
  { type: "sms", label: "SMS", color: "#F97316", blurb: "Twilio / provider number", setupMethod: "Provider API" },
  { type: "web", label: "Web Chat", color: "#06B6D4", blurb: "Embeddable site chat widget", setupMethod: "Snippet" },
  { type: "webhook", label: "Webhook", color: "#A78BFA", blurb: "Generic inbound/outbound webhook", setupMethod: "URL + Secret" },
  { type: "custom", label: "Custom Channel", color: "#5C616B", blurb: "Any private API, bot or protocol", setupMethod: "Free-form config" },
];
export const integrationsRepo = createRepo<Integration>("integrations", [
  { name: "OpenRouter", category: "AI Provider", status: "disconnected" },
  { name: "Slack", category: "Communication", status: "disconnected" },
  { name: "Google Sheets", category: "Data", status: "disconnected" },
]);
const D = 24 * 3600 * 1000;
const _now = Date.now();
export const jobsRepo = createRepo<Job>("jobs", [
  { title: "Q3 Sales Report", agent: "Sales Agent", type: "report", module: "sales", status: "running", step: 2, totalSteps: 5, startedAt: _now - 2 * 3600 * 1000 },
  { title: "Instagram Campaign", agent: "Marketing Agent", type: "campaign", module: "marketing", status: "review", step: 3, totalSteps: 4, startedAt: _now - 5 * 3600 * 1000 },
  { title: "Onboard Acme Corp", agent: "Support Agent", type: "onboarding", module: "ops", status: "completed", step: 4, totalSteps: 4, startedAt: _now - 1 * D, completedAt: _now - 22 * 3600 * 1000, durationMs: 2 * 3600 * 1000 },
  { title: "Reconcile May Invoices", agent: "Finance Agent", type: "reconciliation", module: "finance", status: "completed", step: 6, totalSteps: 6, startedAt: _now - 2 * D, completedAt: _now - 2 * D + 3 * 3600 * 1000, durationMs: 3 * 3600 * 1000 },
  { title: "Weekly SEO Digest", agent: "Marketing Agent", type: "report", module: "marketing", status: "failed", step: 2, totalSteps: 5, startedAt: _now - 3 * D, notes: "API rate limit" },
  { title: "Lead Qualification Batch", agent: "Sales Agent", type: "batch", module: "sales", status: "queued", step: 0, totalSteps: 3 },
  { title: "Vendor KYC Verify", agent: "Support Agent", type: "verification", module: "ops", status: "blocked", step: 1, totalSteps: 4, notes: "Awaiting documents" },
  { title: "Customer Refund #4821", agent: "Finance Agent", type: "refund", module: "finance", status: "approved", step: 3, totalSteps: 3, startedAt: _now - 6 * 3600 * 1000, completedAt: _now - 30 * 60 * 1000, durationMs: 5.5 * 3600 * 1000 },
  { title: "Support Ticket Triage", agent: "Support Agent", type: "triage", module: "ops", status: "completed", step: 2, totalSteps: 2, startedAt: _now - 4 * D, completedAt: _now - 4 * D + 45 * 60 * 1000, durationMs: 45 * 60 * 1000 },
  { title: "Landing Page A/B Test", agent: "Marketing Agent", type: "experiment", module: "marketing", status: "pending", step: 0, totalSteps: 5 },
]);
export const memoryRepo = createRepo<MemoryItem>("memory", [
  { title: "Brand voice", scope: "system", content: "Confident, warm, precise.", tags: "brand" },
]);
export const knowledgeRepo = createRepo<KnowledgePack>("knowledge", [
  { name: "Product docs", source: "upload", itemCount: 0 },
]);
export const workspacesRepo = createRepo<Workspace>("workspaces", [
  { name: "Digi Business OS", path: "~/projects/digi-os", category: "repo", tags: "primary", active: true },
  { name: "Skills Library", path: "~/skills", category: "skills", active: true },
]);
export const commandRunsRepo = createRepo<CommandRun>("commandRuns", []);
export const fileOpsRepo = createRepo<FileOp>("fileOps", []);

export const knowledgeItemsRepo = createRepo<KnowledgeItem>("knowledgeItems", [
  { title: "Bash Cheatsheet", category: "Terminal", subcategory: "Shell", format: "reference", content: "ls, cd, grep, sed, awk...", tags: "bash", active: true },
  { title: "Git Recovery", category: "Coding", subcategory: "Git", format: "sop", content: "git reflog, git restore...", tags: "git", active: true },
  { title: "Playwright Selectors", category: "Browser Automation", subcategory: "Selectors", format: "reference", content: "get_by_role, get_by_label...", tags: "browser", active: true },
  { title: "Stripe Webhook Verify", category: "Integrations", subcategory: "Stripe", format: "snippet", content: "constructEvent(payload, sig, secret)", tags: "stripe", active: true },
  { title: "Client Onboarding SOP", category: "Business Automation", subcategory: "Onboarding", format: "sop", content: "1. Collect KYC 2. Verify 3. Provision", tags: "sop", active: true },
  { title: "WhatsApp Reply Style", category: "Channels", subcategory: "WhatsApp", format: "prompt", content: "Be warm, concise, bilingual.", tags: "whatsapp", active: true },
]);

// ─── Taxonomy (default category tree; user-extendable at runtime) ────────
export const TAXONOMY = {
  skills: {
    "Coding": ["Python", "TypeScript", "Shell", "APIs", "Debugging", "Repo Analysis"],
    "Browser": ["Search", "Form Automation", "Scraping", "Login Flows"],
    "Document / OCR": ["Extraction", "Classification", "Redaction"],
    "Messaging": ["WhatsApp", "Email", "Telegram"],
    "Marketing": ["Content", "SEO", "Social"],
    "Sales": ["Outreach", "Quoting", "Follow-up"],
    "Verification": ["KYC", "AML", "Doc Verify"],
    "Research": ["Web", "Docs", "Competitive"],
    "File / Workspace": ["Read", "Write", "Scan"],
    "Integration": ["Payments", "Comms", "Data"],
    "Backend / DevOps": ["Deploy", "Monitor", "CI"],
    "Voice / Assistant": ["STT", "TTS", "Wake"],
    "Automation / Workflow": ["Trigger", "Router", "Notifier"],
    "Language": ["Translation", "Rewrite"],
    "Writing": ["Summarization", "Draft"],
  },
  tools: {
    "File / Workspace": ["IO", "Search", "Diff"],
    "Terminal": ["Shell", "Package Mgr", "Build"],
    "Browser": ["Search", "Navigate", "Extract"],
    "OCR / Document": ["Parse", "Convert"],
    "Messaging": ["Email", "WhatsApp", "Telegram"],
    "Data Extraction": ["HTML", "PDF", "Structured"],
    "Verification": ["KYC", "Address"],
    "Coding / Dev": ["Repo", "Lint", "Test"],
    "Integration": ["Stripe", "Wise", "Sheets"],
    "Marketing": ["Analytics", "Ads"],
    "Sales": ["CRM"],
    "Monitoring / Logging": ["Logs", "Alerts"],
    "Scheduler / Cron": ["Cron", "Queue"],
  },
  knowledge: {
    "Coding": ["Python", "TypeScript", "Shell", "APIs", "Debugging", "Deployment", "Git"],
    "Terminal": ["Shell", "Env Setup", "Build"],
    "Browser Automation": ["Selectors", "Login", "Scraping"],
    "Business Automation": ["Onboarding", "Support", "Orders", "Verification"],
    "Channels": ["WhatsApp", "Email", "Telegram"],
    "Integrations": ["Stripe", "PayPal", "Wise", "Payoneer", "WorldFirst", "Companies House"],
    "Internal SOPs": ["Ops", "Compliance"],
    "Prompts": ["System", "Persona"],
    "Templates": ["Docs", "Emails"],
    "Agent Instructions": [],
    "Tool Instructions": [],
    "Workflow Instructions": [],
  },
} as const;

// ─── System settings (execution model etc.) ────────────────────────────────
export type ExecutionMode = "tools-first" | "workflows-first" | "ai-first";
const SYS_KEY = "digi.system.settings";
export interface SystemSettings {
  executionMode: ExecutionMode;
  allowLocalTerminal: boolean;
  allowLocalFiles: boolean;
  allowBrowser: boolean;
  requireApprovalOnRisky: boolean;
}
const DEFAULT_SETTINGS: SystemSettings = {
  executionMode: "tools-first",
  allowLocalTerminal: false,
  allowLocalFiles: false,
  allowBrowser: true,
  requireApprovalOnRisky: true,
};
export function getSystemSettings(): SystemSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try { const raw = localStorage.getItem(SYS_KEY); return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS; }
  catch { return DEFAULT_SETTINGS; }
}
export function setSystemSettings(patch: Partial<SystemSettings>) {
  if (typeof window === "undefined") return;
  const next = { ...getSystemSettings(), ...patch };
  localStorage.setItem(SYS_KEY, JSON.stringify(next));
}


// ─── React hook ─────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
export function useRepo<T extends Entity>(repo: ReturnType<typeof createRepo<T>>) {
  const [items, setItems] = useState<T[]>(() => repo.list());
  useEffect(() => { const unsub = repo.subscribe(() => setItems(repo.list())); return () => { unsub(); }; }, [repo]);
  return items;
}
