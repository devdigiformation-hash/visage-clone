import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { ListChecks, Play, Pause, AlertTriangle, CheckCircle2, Clock, Users, ArrowRight, Search, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { jobsRepo, useRepo, type Job, type JobStatus } from "@/lib/repo";

const STATUS_COLOR: Record<JobStatus, string> = {
  queued: "#94A3B8", pending: "#94A3B8", running: "#2FE0C8",
  review: "#F59E0B", approved: "#22C55E", completed: "#22C55E",
  failed: "#EF4444", blocked: "#EF4444", cancelled: "#5C616B",
};
const STATUS_LABEL: Record<JobStatus, string> = {
  queued: "QUEUED", pending: "PENDING", running: "RUNNING",
  review: "REVIEW", approved: "APPROVED", completed: "DONE",
  failed: "FAILED", blocked: "BLOCKED", cancelled: "CANCELLED",
};

type Bucket = "all" | "active" | "pending" | "review" | "stuck" | "completed";

function bucketOf(s: JobStatus): Exclude<Bucket, "all"> {
  if (s === "running") return "active";
  if (s === "queued" || s === "pending") return "pending";
  if (s === "review") return "review";
  if (s === "failed" || s === "blocked") return "stuck";
  return "completed";
}

function relTime(ts?: number) {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function StatCard({ label, count, color, active, onClick, Icon }: {
  label: string; count: number; color: string; active: boolean; onClick: () => void; Icon: any;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, minWidth: 130, textAlign: "left", cursor: "pointer",
        padding: "14px 16px", borderRadius: 10,
        background: active ? `${color}10` : "#0D1017",
        border: `1px solid ${active ? `${color}55` : "#1A1D24"}`,
        transition: "all 120ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
          background: `${color}18`, border: `1px solid ${color}35`,
        }}>
          <Icon size={14} color={color} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#F5F6F8", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
          {count}
        </div>
      </div>
      <div style={{ fontSize: 10.5, color: "#7A8090", letterSpacing: "0.14em", textTransform: "uppercase" }}>
        {label}
      </div>
    </button>
  );
}

function TaskRow({ j }: { j: Job }) {
  const c = STATUS_COLOR[j.status];
  const pct = j.totalSteps ? Math.round(((j.step || 0) / j.totalSteps) * 100) : 0;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "110px 1fr 160px 140px 110px",
      alignItems: "center", gap: 14,
      padding: "12px 14px", borderTop: "1px solid #12151C",
      fontSize: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
        <span style={{ fontSize: 9.5, color: c, letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" }}>
          {STATUS_LABEL[j.status]}
        </span>
      </div>

      <div>
        <div style={{ color: "#F5F6F8", fontWeight: 500, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {j.title}
        </div>
        {j.notes && (
          <div style={{ fontSize: 10.5, color: "#EF4444B0", display: "flex", alignItems: "center", gap: 4 }}>
            <AlertTriangle size={10} /> {j.notes}
          </div>
        )}
      </div>

      <div style={{ color: "#8A909C", fontSize: 11.5, display: "flex", alignItems: "center", gap: 5 }}>
        <Users size={11} /> {j.agent}
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: "#7A8090", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
          <span>step {j.step || 0}/{j.totalSteps || 0}</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 4, background: "#12151C", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: c, transition: "width 200ms ease" }} />
        </div>
      </div>

      <div style={{ color: "#7A8090", fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
        <Clock size={10} /> {relTime(j.startedAt || j.completedAt)}
      </div>
    </div>
  );
}

function TaskAnalyticsPage() {
  const jobs = useRepo(jobsRepo);
  const [bucket, setBucket] = useState<Bucket>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c = { active: 0, pending: 0, review: 0, stuck: 0, completed: 0 };
    for (const j of jobs) c[bucketOf(j.status)]++;
    return c;
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs
      .filter(j => bucket === "all" || bucketOf(j.status) === bucket)
      .filter(j => !q || j.title.toLowerCase().includes(q.toLowerCase()) || j.agent.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        const rank: Record<JobStatus, number> = { running: 0, review: 1, failed: 2, blocked: 2, queued: 3, pending: 3, approved: 4, completed: 5, cancelled: 6 };
        return rank[a.status] - rank[b.status];
      });
  }, [jobs, bucket, q]);

  const activeList = useMemo(() => jobs.filter(j => j.status === "running" || j.status === "review"), [jobs]);

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      {/* Header */}
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #1A1D24", display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: "#2FE0C818", border: "1px solid #2FE0C840", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px #2FE0C820" }}>
          <ListChecks size={20} color="#2FE0C8" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#F5F6F8", margin: 0 }}>Task Analytics</h1>
          <p style={{ fontSize: 12, color: "#7A8090", margin: "3px 0 0" }}>
            Operational visibility across all assigned work — active, stuck, pending approval, and completed.
          </p>
        </div>
        <Link to="/jobs" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 8,
          background: "#2FE0C815", border: "1px solid #2FE0C845", color: "#2FE0C8",
          fontSize: 12, textDecoration: "none",
        }}>
          Full Job Board <ArrowRight size={12} />
        </Link>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Stat cards */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <StatCard label="Active"   count={counts.active}    color="#2FE0C8" Icon={Play}          active={bucket === "active"}    onClick={() => setBucket(bucket === "active" ? "all" : "active")} />
          <StatCard label="Pending"  count={counts.pending}   color="#94A3B8" Icon={Pause}         active={bucket === "pending"}   onClick={() => setBucket(bucket === "pending" ? "all" : "pending")} />
          <StatCard label="Review"   count={counts.review}    color="#F59E0B" Icon={Clock}         active={bucket === "review"}    onClick={() => setBucket(bucket === "review" ? "all" : "review")} />
          <StatCard label="Stuck"    count={counts.stuck}     color="#EF4444" Icon={AlertTriangle} active={bucket === "stuck"}     onClick={() => setBucket(bucket === "stuck" ? "all" : "stuck")} />
          <StatCard label="Completed" count={counts.completed} color="#22C55E" Icon={CheckCircle2} active={bucket === "completed"} onClick={() => setBucket(bucket === "completed" ? "all" : "completed")} />
        </div>

        {/* Multi-task active band */}
        <div style={{ background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Play size={13} color="#2FE0C8" />
              <span style={{ fontSize: 10.5, color: "#C4C8D0", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
                Currently Running · {activeList.length} parallel
              </span>
            </div>
            <span style={{ fontSize: 10.5, color: "#5C616B", fontFamily: "'JetBrains Mono', monospace" }}>
              live
            </span>
          </div>
          {activeList.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#5C616B", fontSize: 12 }}>
              No active tasks right now.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
              {activeList.map(j => {
                const c = STATUS_COLOR[j.status];
                const pct = j.totalSteps ? Math.round(((j.step || 0) / j.totalSteps) * 100) : 0;
                return (
                  <div key={j.id} style={{ padding: 12, borderRadius: 8, background: "#0A0D13", border: `1px solid ${c}30` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
                      <span style={{ fontSize: 9, color: c, letterSpacing: "0.14em", fontFamily: "'JetBrains Mono', monospace" }}>{STATUS_LABEL[j.status]}</span>
                      <span style={{ marginLeft: "auto", fontSize: 10, color: "#7A8090", fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
                    </div>
                    <div style={{ color: "#F5F6F8", fontSize: 12.5, fontWeight: 500, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {j.title}
                    </div>
                    <div style={{ color: "#7A8090", fontSize: 10.5, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                      {j.agent} · step {j.step}/{j.totalSteps}
                    </div>
                    <div style={{ height: 3, background: "#12151C", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: c }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Full task table */}
        <div style={{ background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 10 }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #1A1D24", display: "flex", alignItems: "center", gap: 10 }}>
            <Filter size={12} color="#7A8090" />
            <span style={{ fontSize: 10.5, color: "#C4C8D0", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
              {bucket === "all" ? "All Tasks" : bucket} · {filtered.length}
            </span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "#0A0D13", border: "1px solid #1A1D24", borderRadius: 7, padding: "5px 9px" }}>
              <Search size={11} color="#5C616B" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title or agent…"
                style={{ background: "transparent", border: "none", outline: "none", color: "#F5F6F8", fontSize: 11.5, width: 200 }}
              />
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "110px 1fr 160px 140px 110px",
            gap: 14, padding: "10px 14px",
            fontSize: 9.5, color: "#5C616B", letterSpacing: "0.14em", textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <div>Status</div><div>Task</div><div>Agent</div><div>Progress</div><div style={{ textAlign: "right" }}>Updated</div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "#5C616B", fontSize: 12, borderTop: "1px solid #12151C" }}>
              No tasks match this filter.
            </div>
          ) : filtered.map(j => <TaskRow key={j.id} j={j} />)}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/command")({
  head: () => ({ meta: [
    { title: "Task Analytics · Digi OS" },
    { name: "description", content: "Operational visibility across all assigned tasks — active, pending, stuck, and completed." },
  ] }),
  component: () => <AppShell><TaskAnalyticsPage /></AppShell>,
});
