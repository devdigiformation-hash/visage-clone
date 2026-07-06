// Central orchestrator brain for the Digi Business OS voice globe.
// The globe is the command center — it does NOT execute directly;
// it plans and delegates to tools / workflows / agents / workspace ops,
// then reports back. This module is the backend-ready shell for that.

import {
  agentsRepo, channelsRepo, integrationsRepo, knowledgeItemsRepo, modelsRepo,
  skillsRepo, toolsRepo, workflowsRepo, workspacesRepo, getSystemSettings,
  type Agent, type Skill, type Tool, type Workflow, type KnowledgeItem,
} from "./repo";

// ─── Types ────────────────────────────────────────────────────────────────
export type Intent =
  | "info" | "task" | "file_op" | "browser" | "workflow_run" | "agent_task"
  | "verify" | "communicate" | "code_terminal" | "system_manage" | "unknown";

export type ExecutorKind = "tool" | "workflow" | "agent" | "workspace" | "browser" | "channel" | "ai";

export interface DelegationStep {
  kind: ExecutorKind;
  refId?: string;
  refName: string;
  reason: string;
}

export interface Plan {
  id: string;
  createdAt: number;
  input: string;
  intent: Intent;
  confidence: number;
  steps: DelegationStep[];
  fallback: "ai" | "human";
  needsApproval: boolean;
}

export interface AssistantSession {
  activeWorkspaceId?: string;
  activeModelId?: string;
  activeAgentId?: string;
  mode: "chat" | "voice" | "task";
  recent: { at: number; input: string; planId: string }[];
}

// ─── Capability index (aware of the whole OS) ─────────────────────────────
export interface CapabilityIndex {
  skills: Skill[];
  tools: Tool[];
  agents: Agent[];
  workflows: Workflow[];
  knowledge: KnowledgeItem[];
  workspaces: ReturnType<typeof workspacesRepo.list>;
  integrations: ReturnType<typeof integrationsRepo.list>;
  channels: ReturnType<typeof channelsRepo.list>;
  models: ReturnType<typeof modelsRepo.list>;
  counts: Record<string, number>;
}

export function buildCapabilityIndex(): CapabilityIndex {
  const skills = skillsRepo.list();
  const tools = toolsRepo.list();
  const agents = agentsRepo.list();
  const workflows = workflowsRepo.list();
  const knowledge = knowledgeItemsRepo.list();
  const workspaces = workspacesRepo.list();
  const integrations = integrationsRepo.list();
  const channels = channelsRepo.list();
  const models = modelsRepo.list();
  return {
    skills, tools, agents, workflows, knowledge, workspaces, integrations, channels, models,
    counts: {
      skills: skills.length, tools: tools.length, agents: agents.length,
      workflows: workflows.length, knowledge: knowledge.length,
      workspaces: workspaces.length, integrations: integrations.length,
      channels: channels.length, models: models.length,
    },
  };
}

// ─── Intent classification (keyword heuristic; swap for LLM later) ────────
const INTENT_RULES: { intent: Intent; patterns: RegExp[] }[] = [
  { intent: "file_op",       patterns: [/\b(folder|file|create file|scan repo|read file|edit file|move file)\b/i] },
  { intent: "code_terminal", patterns: [/\b(terminal|run script|npm|bun|git|install|build|deploy|repo|codebase)\b/i] },
  { intent: "browser",       patterns: [/\b(browse|open url|scrape|screenshot|form|login page)\b/i] },
  { intent: "workflow_run",  patterns: [/\b(run workflow|start workflow|trigger|automation)\b/i] },
  { intent: "verify",        patterns: [/\b(verify|kyc|check documents|validate|passport|id check)\b/i] },
  { intent: "communicate",   patterns: [/\b(email|whatsapp|telegram|send message|reply|notify)\b/i] },
  { intent: "system_manage", patterns: [/\b(settings|integration|model|provider|configure|connect)\b/i] },
  { intent: "agent_task",    patterns: [/\b(agent|delegate to|route to|assign)\b/i] },
  { intent: "info",          patterns: [/\b(what|who|when|list|show|status|summary|explain)\b/i] },
];

export function classifyIntent(input: string): { intent: Intent; confidence: number } {
  const s = input.trim();
  if (!s) return { intent: "unknown", confidence: 0 };
  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((p) => p.test(s))) return { intent: rule.intent, confidence: 0.7 };
  }
  return { intent: "task", confidence: 0.35 };
}

// ─── Planner: intent → delegation steps (tools-first order) ───────────────
function scoreMatch(text: string, hay: string) {
  const t = text.toLowerCase(); const h = hay.toLowerCase();
  if (!t || !h) return 0;
  const toks = t.split(/\s+/).filter((w) => w.length > 3);
  return toks.reduce((n, w) => n + (h.includes(w) ? 1 : 0), 0);
}

export function planDelegation(input: string): Plan {
  const { intent, confidence } = classifyIntent(input);
  const idx = buildCapabilityIndex();
  const settings = getSystemSettings();
  const steps: DelegationStep[] = [];

  const rank = <T extends { name?: string; category?: string; tags?: string }>(items: T[]) =>
    items
      .map((it) => ({ it, s: scoreMatch(input, `${it.name ?? ""} ${it.category ?? ""} ${it.tags ?? ""}`) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => x.it);

  // 1. tools first (respect execution mode)
  if (settings.executionMode !== "ai-first") {
    for (const t of rank(idx.tools.filter((t) => t.active))) {
      steps.push({ kind: "tool", refId: t.id, refName: t.name, reason: `Matched tool category "${t.category}"` });
    }
  }
  // 2. workflows / skills (deterministic)
  for (const w of rank(idx.workflows.filter((w) => w.status === "active"))) {
    steps.push({ kind: "workflow", refId: w.id, refName: w.name, reason: "Matched active workflow" });
  }
  for (const s of rank(idx.skills.filter((s) => s.active))) {
    steps.push({ kind: "tool", refId: s.id, refName: `skill: ${s.name}`, reason: `Skill in "${s.category}"` });
  }
  // 3. agents
  for (const a of rank(idx.agents.filter((a) => a.active))) {
    steps.push({ kind: "agent", refId: a.id, refName: a.name, reason: a.role });
  }
  // 4. intent-specific hooks
  if (intent === "file_op" || intent === "code_terminal") {
    const ws = idx.workspaces.find((w) => w.active);
    if (ws) steps.push({ kind: "workspace", refId: ws.id, refName: ws.name, reason: "Active workspace" });
  }
  if (intent === "communicate") {
    const ch = idx.channels.find((c) => c.active);
    if (ch) steps.push({ kind: "channel", refId: ch.id, refName: ch.name, reason: "Active channel" });
  }
  if (intent === "browser") {
    steps.push({ kind: "browser", refName: "Browser Runtime", reason: "Requires browser automation" });
  }

  const needsApproval =
    settings.requireApprovalOnRisky &&
    (intent === "file_op" || intent === "code_terminal" || intent === "communicate");

  return {
    id: `plan_${Date.now().toString(36)}`,
    createdAt: Date.now(),
    input,
    intent,
    confidence,
    steps,
    fallback: "ai",
    needsApproval,
  };
}

// ─── Session state (persisted) ────────────────────────────────────────────
const SESSION_KEY = "digi.assistant.session";
const PLANS_KEY = "digi.assistant.plans";

export function getSession(): AssistantSession {
  if (typeof window === "undefined") return { mode: "chat", recent: [] };
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : { mode: "chat", recent: [] };
  } catch { return { mode: "chat", recent: [] }; }
}
export function updateSession(patch: Partial<AssistantSession>) {
  if (typeof window === "undefined") return;
  const next = { ...getSession(), ...patch };
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
}

export function listPlans(): Plan[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(PLANS_KEY) ?? "[]"); } catch { return []; }
}
export function savePlan(plan: Plan) {
  if (typeof window === "undefined") return;
  const items = [plan, ...listPlans()].slice(0, 50);
  localStorage.setItem(PLANS_KEY, JSON.stringify(items));
  const session = getSession();
  updateSession({
    recent: [{ at: Date.now(), input: plan.input, planId: plan.id }, ...(session.recent ?? [])].slice(0, 20),
  });
}

// ─── Execution hook (stub — real dispatch wires here later) ───────────────
export interface Executor {
  run(step: DelegationStep, ctx: { plan: Plan }): Promise<{ ok: boolean; output?: string; error?: string }>;
}
const executors: Partial<Record<ExecutorKind, Executor>> = {};
export function registerExecutor(kind: ExecutorKind, ex: Executor) { executors[kind] = ex; }

export async function executePlan(plan: Plan, onStep?: (i: number, res: any) => void) {
  const results: { step: DelegationStep; ok: boolean; output?: string; error?: string }[] = [];
  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    const ex = executors[step.kind];
    const res = ex
      ? await ex.run(step, { plan })
      : { ok: false, error: `No executor registered for "${step.kind}" (backend wiring pending)` };
    results.push({ step, ...res });
    onStep?.(i, res);
    if (!res.ok && plan.needsApproval) break;
  }
  return results;
}
