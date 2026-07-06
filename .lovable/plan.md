
# Digi Business OS — Clickable Product Shell + Functional Chat Panel

The scope you've described (13 management modules + full chat workspace + reusable component system + seed data + routing + backend-ready service layer) is **too large for one atomic edit**. I'll structure it into phases you can approve/adjust. Each phase ships something usable — no dead clicks introduced between phases.

Design constraints (locked):
- Keep the current DigiApp dashboard, globe, wires, sidebar, right-chat panel visual identity intact.
- Reuse existing tokens/glassmorphism; new pages inherit the same dark cyber look.
- File-based routing via TanStack Start (`src/routes/`).
- Local mock repository pattern (in-memory + localStorage) so real backend can be swapped in without UI rewrites.

---

## Phase 1 — Foundations (routes + shared shell + data layer)

New folders:
```text
src/routes/
  _app.tsx                    → layout wrapper reusing LeftSidebar + top bar
  _app.index.tsx              → mounts existing DigiApp dashboard
  _app.models.tsx
  _app.skills.tsx
  _app.tools.tsx
  _app.agents.tsx
  _app.workflows.tsx
  _app.channels.tsx
  _app.integrations.tsx
  _app.jobs.tsx
  _app.brain.tsx
  _app.memory.tsx
  _app.soul.tsx
  _app.settings.tsx
  _app.command.tsx            → AI Command Center
  _app.town.tsx               → Agent Town

src/modules/
  shared/
    ModulePage.tsx            → header + description + actions + tabs slot
    DataTable.tsx             → sortable, filterable, paginated
    DetailDrawer.tsx
    FormModal.tsx
    ConfirmModal.tsx
    StatusBadge.tsx
    EmptyState.tsx
    SearchFilterBar.tsx
    Tabs.tsx
    Toast.tsx (sonner wrapper)
  repository/
    createRepository.ts       → generic in-memory + localStorage CRUD
    schemas.ts                → zod schemas for every entity
    seed.ts                   → seed data
```

`createRepository<T>()` exposes `list / get / create / update / remove / bulkImport` — later swappable to Supabase / API without touching pages.

Sidebar: every `NAV_ITEMS` and `MODULES` entry becomes a `<Link>` to its route.

## Phase 2 — Chat panel upgrade (right side)

Extend the current right panel (do not redesign):
- Composer: autosize textarea, Enter=send, Shift+Enter=newline, attachment button (file picker + chip preview), mic button (recording state UI), send button with pending state, clear/new-chat.
- Slash-command palette: `/agent /workflow /tool /model /task` — opens a filtered picker; each inserts a structured token into the message.
- **Model Selector** in composer toolbar: grouped by provider (OpenAI · Gemini · DeepSeek · OpenRouter · Ollama · Custom), searchable, connection-status dot, tag chips (local/cloud/free), persists per-session in localStorage. Sources its list from the Models repository so adding a model in `/models` appears here immediately.
- Session control popover: model, agent, toolset, temperature, rename/save/new session.
- Every existing right-panel icon gets a wired action (open uploads, open sessions, open command palette, open task tracker, etc.). Tooltips on all.

## Phase 3 — Management pages (batch A: highest priority)

All share `ModulePage` + `DataTable` + `DetailDrawer` + `FormModal`.

1. **Models** — tabs: All / Providers / API Keys / Local (Ollama) / Routing. Add/edit form with provider, model id, apiKey, baseURL, tags, active, default, test-connection stub.
2. **Skills** — table + category filter. Multi-source create: manual, markdown paste, JSON paste, file import. Fields: name, slug, type (prompt/tool/code/automation/md), content, tags, active.
3. **Tools** — catalog grid + list toggle. Type field (api/local/mcp/script/browser/file). Config JSON editor, credentials, permissions, test-run stub.
4. **Agents** — cards + detail drawer with tabs: Overview / Model / Tools / Skills / Workflows / Channels / Memory / Prompt / Test run.

## Phase 4 — Management pages (batch B)

5. **Workflows** — list, steps outline (linear placeholder), trigger, status (draft/active), duplicate/archive.
6. **Channels** — connect-flow per type (WhatsApp / Email / Telegram / Web / Webhook), credentials, agent binding, test.
7. **Integrations** — catalog of providers, connect modal, credentials store, health status, tags.
8. **Core Jobs** — job templates + running jobs table, link to workflow/agent.
9. **Brain / Memory** — knowledge packs, uploaded docs list, notes, vector-source placeholder, attach-to-agent picker.
10. **Soul** — persona editor: identity, tone, mission, guardrails, brand prompt; version list.
11. **Settings** — sections: General / System / Credentials / Model Defaults / Storage / Security.
12. **AI Command Center** — command input, quick-launch grid, command history log.
13. **Agent Town** — agent registry overview (uses Agents data) with room grid.

## Phase 5 — Wire dashboard nodes + tracking board

- Left node cards (Memory/Soul/Skills/Settings) → link to matching route.
- Right node cards (Camera/Screen Share/Agent/Tools) → link (Agent→/agents, Tools→/tools, Camera/Screen→open device drawer).
- Lower tracking-board strip stays; hook it to `jobs` repository so real tasks render there.

## Phase 6 — Polish

- Toast on all CRUD.
- Empty states with "Add first X" CTA.
- Command palette (Cmd+K) global.
- localStorage persistence verified across reload.
- Typecheck + Playwright smoke: click every sidebar + node card, confirm each route renders without error.

---

## Technical notes

- **No Supabase yet.** Repository is localStorage-backed so nothing blocks on backend enablement. When you're ready we add a `SupabaseRepository` implementation and swap.
- **No real model calls yet.** Model selector + test-connection are UI-complete but stubs — hooking them to Lovable AI Gateway is a follow-up phase (needs Cloud enabled).
- Reuses existing `SettingsDialog / MemoryDialog / SoulDialog / SkillsDialog` where sensible — the new full pages become the primary surface; dialogs remain as quick-edit affordances from the globe cards.

---

## What I need from you

This will take **~6 sequential turns** (one per phase). Options:

**A. Approve full plan** → I execute Phase 1 immediately, then continue phase-by-phase across turns.
**B. Approve + reorder** → tell me which phases to prioritize (e.g. "Chat panel + Models + Skills first, rest later").
**C. Trim scope** → drop modules you don't need yet (e.g. skip Soul/Brain/Command Center for now).

Reply with A / B / C (and any adjustments) and I'll start.
