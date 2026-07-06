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
export interface Agent extends Entity { name: string; role: string; modelId?: string; toolIds?: string; skillIds?: string; prompt?: string; active: boolean; }
export interface Workflow extends Entity { name: string; trigger: string; steps?: string; status: "draft" | "active" | "archived"; notes?: string; }
export interface Channel extends Entity { name: string; type: "whatsapp" | "email" | "telegram" | "web" | "webhook" | "custom"; credentials?: string; agentId?: string; active: boolean; }
export interface Integration extends Entity { name: string; category: string; apiKey?: string; endpoint?: string; status: "connected" | "disconnected" | "error"; notes?: string; }
export interface Job extends Entity { title: string; agent: string; workflowId?: string; status: "pending" | "running" | "review" | "approved" | "completed"; step: number; totalSteps: number; notes?: string; }
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
  { name: "Summarize Text", category: "Writing", type: "prompt", content: "You are an expert summarizer...", tags: "writing", active: true },
  { name: "Translate to Urdu", category: "Language", type: "prompt", content: "Translate the following to fluent Urdu...", tags: "language", active: true },
  { name: "Extract Invoice Data", category: "Finance", type: "tool", content: "Extract structured invoice fields.", tags: "finance,extract", active: true },
]);
export const toolsRepo = createRepo<Tool>("tools", [
  { name: "Web Search", type: "api", provider: "Serper", endpoint: "https://api.serper.dev/search", active: true },
  { name: "Send Email", type: "api", provider: "Resend", active: true },
  { name: "File Reader", type: "local", active: true },
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
  { name: "Support WhatsApp", type: "whatsapp", active: true },
  { name: "Sales Email", type: "email", active: true },
]);
export const integrationsRepo = createRepo<Integration>("integrations", [
  { name: "OpenRouter", category: "AI Provider", status: "disconnected" },
  { name: "Slack", category: "Communication", status: "disconnected" },
  { name: "Google Sheets", category: "Data", status: "disconnected" },
]);
export const jobsRepo = createRepo<Job>("jobs", [
  { title: "Q3 Sales Report", agent: "Sales Agent", status: "running", step: 2, totalSteps: 5 },
  { title: "Instagram Campaign", agent: "Marketing Agent", status: "review", step: 3, totalSteps: 4 },
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

// ─── React hook ─────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
export function useRepo<T extends Entity>(repo: ReturnType<typeof createRepo<T>>) {
  const [items, setItems] = useState<T[]>(() => repo.list());
  useEffect(() => { const unsub = repo.subscribe(() => setItems(repo.list())); return () => { unsub(); }; }, [repo]);
  return items;
}
