import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { useMemo, useState } from "react";
import {
  BarChart2, Activity, ListChecks, TrendingUp, Download, Search,
  ExternalLink, CheckCircle2, AlertTriangle, Clock, PlayCircle, XCircle,
} from "lucide-react";
import {
  jobsRepo, modelsRepo, skillsRepo, toolsRepo, agentsRepo, workflowsRepo,
  channelsRepo, integrationsRepo, useRepo, type Job, type JobStatus,
} from "@/lib/repo";

const STATUS_META: Record<JobStatus, { color: string; label: string }> = {
  queued:    { color: "#94A3B8", label: "Queued" },
  pending:   { color: "#94A3B8", label: "Pending" },
  running:   { color: "#2FE0C8", label: "Running" },
  review:    { color: "#F59E0B", label: "Review" },
  approved:  { color: "#22C55E", label: "Approved" },
  completed: { color: "#22C55E", label: "Completed" },
  failed:    { color: "#EF4444", label: "Failed" },
  blocked:   { color: "#EF4444", label: "Blocked" },
  cancelled: { color: "#5C616B", label: "Cancelled" },
};

type Tab = "overview" | "tasks" | "history" | "performance" | "inventory";

function AnalyticsPage() {
  const jobs = useRepo(jobsRepo);
  const models = useRepo(modelsRepo);
  const skills = useRepo(skillsRepo);
  const tools = useRepo(toolsRepo);
  const agents = useRepo(agentsRepo);
  const workflows = useRepo(workflowsRepo);
  const channels = useRepo(channelsRepo);
  const integrations = useRepo(integrationsRepo);

  const [tab, setTab] = useState<Tab>("overview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [range, setRange] = useState<"1d" | "7d" | "30d" | "all">("30d");
  const [selected, setSelected] = useState<Job | null>(null);

  const modules = useMemo(() => Array.from(new Set(jobs.map(j => j.module).filter(Boolean))) as string[], [jobs]);

  const filtered = useMemo(() => {
    const cutoff =
      range === "1d" ? Date.now() - 24 * 3600 * 1000 :
      range === "7d" ? Date.now() - 7 * 24 * 3600 * 1000 :
      range === "30d" ? Date.now() - 30 * 24 * 3600 * 1000 : 0;
    return jobs.filter(j => {
      if (cutoff && (j.updatedAt || 0) < cutoff) return false;
      if (statusFilter !== "all" && j.status !== statusFilter) return false;
      if (moduleFilter !== "all" && j.module !== moduleFilter) return false;
      if (query && !j.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [jobs, query, statusFilter, moduleFilter, range]);

  const summary = useMemo(() => {
    const by = (s: JobStatus) => jobs.filter(j => j.status === s).length;
    const done = by("completed") + by("approved");
    const durations = jobs.filter(j => j.durationMs).map(j => j.durationMs!) as number[];
    const avgMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    return {
      total: jobs.length,
      running: by("running"),
      review: by("review"),
      queued: by("queued") + by("pending"),
      stuck: by("failed") + by("blocked"),
      completed: done,
      cancelled: by("cancelled"),
      successRate: jobs.length ? Math.round((done / jobs.length) * 100) : 0,
      avgDurationMin: Math.round(avgMs / 60000),
    };
  }, [jobs]);

  const trend = useMemo(() => {
    const days = 14;
    const buckets = Array.from({ length: days }, (_, i) => {
      const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - (days - 1 - i));
      const dayEnd = dayStart.getTime() + 24 * 3600 * 1000;
      const completed = jobs.filter(j => (j.status === "completed" || j.status === "approved") && j.completedAt && j.completedAt >= dayStart.getTime() && j.completedAt < dayEnd).length;
      const stuck = jobs.filter(j => (j.status === "failed" || j.status === "blocked") && (j.updatedAt || 0) >= dayStart.getTime() && (j.updatedAt || 0) < dayEnd).length;
      return { label: dayStart.toLocaleDateString(undefined, { month: "short", day: "numeric" }), completed, stuck };
    });
    const max = Math.max(1, ...buckets.map(b => Math.max(b.completed, b.stuck)));
    return { buckets, max };
  }, [jobs]);

  const byAgent = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach(j => map.set(j.agent, (map.get(j.agent) || 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const byModule = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach(j => { if (j.module) map.set(j.module, (map.get(j.module) || 0) + 1); });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const exportCsv = () => {
    const cols = ["id", "title", "type", "module", "agent", "status", "step", "totalSteps", "createdAt", "startedAt", "completedAt", "durationMs", "notes"];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [cols.join(",")].concat(filtered.map(j => cols.map(c => esc((j as any)[c])).join(",")));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `digi-tasks-${Date.now()}.csv`; a.click();
  };

  const TABS: { key: Tab; label: string; Icon: any; color: string }[] = [
    { key: "overview",    label: "Overview",    Icon: BarChart2, color: "#2FE0C8" },
    { key: "tasks",       label: "Tasks",       Icon: ListChecks, color: "#3B82F6" },
    { key: "history",     label: "History",     Icon: Clock,     color: "#94A3B8" },
    { key: "performance", label: "Performance", Icon: TrendingUp, color: "#22C55E" },
    { key: "inventory",   label: "Inventory",   Icon: Activity,  color: "#F5A623" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #1A1D24", display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#2FE0C818", border: "1px solid #2FE0C840", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart2 size={20} color="#2FE0C8" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "#F5F6F8", margin: 0 }}>Task & Operations Analytics</h1>
            <p style={{ fontSize: 12, color: "#7A8090", margin: "3px 0 0" }}>Reporting, trends, filters and exports for all work executed by Digi OS.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={range} onChange={e => setRange(e.target.value as any)} style={ctrl}>
            <option value="1d">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
          <button onClick={exportCsv} style={{ ...ctrl, color: "#2FE0C8", borderColor: "#2FE0C840", background: "#2FE0C812", display: "inline-flex", gap: 6, alignItems: "center" }}>
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Tab rail */}
      <div style={{ display: "flex", gap: 2, padding: "10px 20px", borderBottom: "1px solid #1A1D24", background: "#080A0F" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px",
            borderRadius: 6, border: "1px solid", cursor: "pointer", fontSize: 11.5,
            background: tab === t.key ? `${t.color}18` : "transparent",
            borderColor: tab === t.key ? `${t.color}66` : "transparent",
            color: tab === t.key ? t.color : "#8A909C",
          }}>
            <t.Icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }} className="custom-scroll">
        <div style={{ padding: 24 }}>
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                <StatCard label="Total tasks"     n={summary.total}          color="#F5F6F8" Icon={ListChecks} />
                <StatCard label="Running"         n={summary.running}        color="#2FE0C8" Icon={PlayCircle} />
                <StatCard label="Awaiting review" n={summary.review}         color="#F59E0B" Icon={AlertTriangle} />
                <StatCard label="Queued"          n={summary.queued}         color="#94A3B8" Icon={Clock} />
                <StatCard label="Stuck / failed"  n={summary.stuck}          color="#EF4444" Icon={XCircle} />
                <StatCard label="Completed"       n={summary.completed}      color="#22C55E" Icon={CheckCircle2} />
                <StatCard label="Success rate"    n={`${summary.successRate}%`} color="#22C55E" Icon={TrendingUp} />
                <StatCard label="Avg duration"    n={`${summary.avgDurationMin}m`} color="#7DD3FC" Icon={Activity} />
              </div>

              <Panel title="Completion Trend · 14 days">
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160, padding: "8px 4px" }}>
                  {trend.buckets.map((b, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 130, width: "100%", gap: 2 }}>
                        <div title={`${b.stuck} stuck`} style={{ height: `${(b.stuck / trend.max) * 100}%`, background: "#EF444460", borderRadius: 3, minHeight: b.stuck ? 2 : 0 }} />
                        <div title={`${b.completed} completed`} style={{ height: `${(b.completed / trend.max) * 100}%`, background: "linear-gradient(to top, #22C55E, #2FE0C8)", borderRadius: 3, minHeight: b.completed ? 2 : 0 }} />
                      </div>
                      <div style={{ fontSize: 8.5, color: "#5C616B", fontFamily: "'JetBrains Mono', monospace", transform: "rotate(-40deg)", transformOrigin: "top left", whiteSpace: "nowrap", marginTop: 6 }}>{b.label}</div>
                    </div>
                  ))}
                </div>
                <Legend items={[{ label: "Completed", color: "#22C55E" }, { label: "Stuck", color: "#EF4444" }]} />
              </Panel>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Panel title="Tasks by Agent">
                  <BarList items={byAgent} color="#A78BFA" />
                </Panel>
                <Panel title="Tasks by Module">
                  <BarList items={byModule} color="#F5A623" />
                </Panel>
              </div>
            </div>
          )}

          {(tab === "tasks" || tab === "history") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}>
                  <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#5C616B" }} />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks…" style={{ ...ctrl, width: "100%", paddingLeft: 28 }} />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} style={ctrl}>
                  <option value="all">All statuses</option>
                  {Object.keys(STATUS_META).map(s => <option key={s} value={s}>{STATUS_META[s as JobStatus].label}</option>)}
                </select>
                <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} style={ctrl}>
                  <option value="all">All modules</option>
                  {modules.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div style={{ marginLeft: "auto", fontSize: 11, color: "#7A8090", alignSelf: "center" }}>{filtered.length} of {jobs.length}</div>
              </div>

              <div style={{ border: "1px solid #1A1D24", borderRadius: 10, overflow: "hidden", background: "#0D1017" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 110px 90px 110px 100px 34px", padding: "10px 14px", background: "#0A0C12", borderBottom: "1px solid #1A1D24", fontSize: 10, color: "#7A8090", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>Task</span><span>Module</span><span>Agent</span><span>Status</span><span>Progress</span><span>Updated</span><span></span>
                </div>
                {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#5C616B", fontSize: 12 }}>No tasks match current filters.</div>}
                {filtered.map(j => (
                  <div key={j.id} onClick={() => setSelected(j)} style={{
                    display: "grid", gridTemplateColumns: "1fr 100px 110px 90px 110px 100px 34px",
                    padding: "11px 14px", borderBottom: "1px solid #12141B",
                    fontSize: 12, color: "#C4C8D0", cursor: "pointer", alignItems: "center",
                  }} onMouseEnter={e => (e.currentTarget.style.background = "#12141B")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ color: "#F5F6F8", fontWeight: 500 }}>{j.title}</span>
                    <span style={{ color: "#7A8090", fontSize: 11 }}>{j.module || "—"}</span>
                    <span style={{ fontSize: 11 }}>{j.agent}</span>
                    <StatusBadge status={j.status} />
                    <span style={{ fontSize: 11, color: "#7A8090" }}>{j.step}/{j.totalSteps}</span>
                    <span style={{ fontSize: 10.5, color: "#5C616B", fontFamily: "'JetBrains Mono', monospace" }}>{relTime(j.updatedAt)}</span>
                    <ExternalLink size={12} color="#5C616B" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "performance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Panel title="Throughput · last 14 days">
                <div style={{ display: "flex", gap: 24, padding: "8px 4px" }}>
                  <Metric label="Completed" value={trend.buckets.reduce((a, b) => a + b.completed, 0)} color="#22C55E" />
                  <Metric label="Stuck" value={trend.buckets.reduce((a, b) => a + b.stuck, 0)} color="#EF4444" />
                  <Metric label="Success rate" value={`${summary.successRate}%`} color="#2FE0C8" />
                  <Metric label="Avg duration" value={`${summary.avgDurationMin} min`} color="#7DD3FC" />
                </div>
              </Panel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Panel title="Bottlenecks (blocked / failed)">
                  {jobs.filter(j => j.status === "failed" || j.status === "blocked").slice(0, 8).map(j => (
                    <div key={j.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #12141B", fontSize: 11.5, color: "#C4C8D0" }}>
                      <span>{j.title}</span>
                      <span style={{ color: "#EF4444", fontSize: 10.5 }}>{j.notes || j.status}</span>
                    </div>
                  ))}
                  {jobs.filter(j => j.status === "failed" || j.status === "blocked").length === 0 && <div style={{ color: "#5C616B", fontSize: 11 }}>No bottlenecks — clean run.</div>}
                </Panel>
                <Panel title="Awaiting approval">
                  {jobs.filter(j => j.status === "review").map(j => (
                    <div key={j.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #12141B", fontSize: 11.5, color: "#C4C8D0" }}>
                      <span>{j.title}</span>
                      <a href="/jobs" style={{ color: "#F59E0B", fontSize: 10.5, textDecoration: "none" }}>Open →</a>
                    </div>
                  ))}
                  {jobs.filter(j => j.status === "review").length === 0 && <div style={{ color: "#5C616B", fontSize: 11 }}>Nothing waiting on approval.</div>}
                </Panel>
              </div>
            </div>
          )}

          {tab === "inventory" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {[
                { label: "Models", n: models.length, color: "#F472B6" },
                { label: "Skills", n: skills.length, color: "#3B82F6" },
                { label: "Tools", n: tools.length, color: "#7DD3FC" },
                { label: "Agents", n: agents.length, color: "#A78BFA" },
                { label: "Workflows", n: workflows.length, color: "#8B5CF6" },
                { label: "Channels", n: channels.length, color: "#22C55E" },
                { label: "Integrations", n: integrations.length, color: "#F5A623" },
              ].map(c => (
                <div key={c.label} style={{ padding: 18, background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 10 }}>
                  <div style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "#7A8090", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", marginBottom: 8 }}>{c.label}</div>
                  <div style={{ fontSize: 30, fontWeight: 600, color: c.color }}>{c.n}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drill-in drawer */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: "92vw", background: "#0A0C12", borderLeft: "1px solid #1A1D24", padding: 24, overflowY: "auto" }} className="custom-scroll">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: "#7A8090", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>{selected.module || "task"} · {selected.type || "generic"}</div>
                <h2 style={{ fontSize: 16, color: "#F5F6F8", margin: 0 }}>{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: "#7A8090", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
            <StatusBadge status={selected.status} />
            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <KV k="Agent" v={selected.agent} />
              <KV k="Progress" v={`${selected.step} / ${selected.totalSteps}`} />
              <KV k="Started" v={fmtDate(selected.startedAt)} />
              <KV k="Completed" v={fmtDate(selected.completedAt)} />
              <KV k="Duration" v={selected.durationMs ? `${Math.round(selected.durationMs / 60000)} min` : "—"} />
              <KV k="Updated" v={relTime(selected.updatedAt)} />
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 10, color: "#7A8090", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>Notes</div>
              <div style={{ fontSize: 12, color: "#C4C8D0", background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 8, padding: 12, minHeight: 60 }}>{selected.notes || "No notes yet."}</div>
            </div>
            <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
              <a href="/jobs" style={{ padding: "8px 14px", background: "#2FE0C820", border: "1px solid #2FE0C860", borderRadius: 6, color: "#2FE0C8", fontSize: 12, textDecoration: "none" }}>Open in Task Board</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── small UI helpers ────────────────────────────────────────────────────
const ctrl: React.CSSProperties = { padding: "7px 10px", background: "#0A0C12", border: "1px solid #1A1D24", borderRadius: 6, color: "#F5F6F8", fontSize: 11.5, outline: "none", cursor: "pointer" };

function StatCard({ label, n, color, Icon }: { label: string; n: number | string; color: string; Icon: any }) {
  return (
    <div style={{ padding: 14, background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 9.5, letterSpacing: "0.1em", color: "#7A8090", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
        <Icon size={13} color={color} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, color }}>{n}</div>
    </div>
  );
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "#7A8090", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
function StatusBadge({ status }: { status: JobStatus }) {
  const m = STATUS_META[status];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", background: `${m.color}18`, border: `1px solid ${m.color}44`, borderRadius: 4, color: m.color, fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.color }} />{m.label}
  </span>;
}
function BarList({ items, color }: { items: [string, number][]; color: string }) {
  const max = Math.max(1, ...items.map(i => i[1]));
  if (!items.length) return <div style={{ color: "#5C616B", fontSize: 11 }}>No data yet.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(([label, n]) => (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#C4C8D0", marginBottom: 3 }}>
            <span>{label}</span><span style={{ color: "#7A8090", fontFamily: "'JetBrains Mono', monospace" }}>{n}</span>
          </div>
          <div style={{ height: 6, background: "#12141B", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${(n / max) * 100}%`, height: "100%", background: color, borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
function Metric({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 600, color }}>{value}</div>
      <div style={{ fontSize: 10, color: "#7A8090", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginTop: 3 }}>{label}</div>
    </div>
  );
}
function Legend({ items }: { items: { label: string; color: string }[] }) {
  return <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 10.5, color: "#7A8090" }}>
    {items.map(i => <span key={i.label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: i.color }} />{i.label}</span>)}
  </div>;
}
function KV({ k, v }: { k: string; v: string }) {
  return <div><div style={{ fontSize: 9.5, color: "#5C616B", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>{k}</div><div style={{ fontSize: 12, color: "#F5F6F8" }}>{v}</div></div>;
}
function relTime(t?: number) {
  if (!t) return "—";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function fmtDate(t?: number) {
  if (!t) return "—";
  return new Date(t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Digi OS" }, { name: "description", content: "Task and operations analytics for Digi Business OS." }] }),
  component: () => <AppShell><AnalyticsPage /></AppShell>,
});
