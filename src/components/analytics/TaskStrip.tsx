import { useEffect, useMemo, useState } from "react";
import { jobsRepo, useRepo, type Job, type JobStatus } from "@/lib/repo";
import { Activity, CheckCircle2, AlertTriangle, Clock, ArrowRight } from "lucide-react";

const STATUS_COLOR: Record<JobStatus, string> = {
  queued: "#94A3B8", pending: "#94A3B8", running: "#2FE0C8",
  review: "#F59E0B", approved: "#22C55E", completed: "#22C55E",
  failed: "#EF4444", blocked: "#EF4444", cancelled: "#5C616B",
};

export function TaskStrip() {
  const jobs = useRepo(jobsRepo);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const s = useMemo(() => {
    const isToday = (t?: number) => !!t && Date.now() - t < 24 * 3600 * 1000;
    return {
      total: jobs.length,
      running: jobs.filter(j => j.status === "running").length,
      review: jobs.filter(j => j.status === "review").length,
      queued: jobs.filter(j => j.status === "queued" || j.status === "pending").length,
      stuck: jobs.filter(j => j.status === "failed" || j.status === "blocked").length,
      done: jobs.filter(j => j.status === "completed" || j.status === "approved").length,
      doneToday: jobs.filter(j => (j.status === "completed" || j.status === "approved") && isToday(j.completedAt)).length,
      recent: [...jobs].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 3),
    };
  }, [jobs]);

  if (!mounted) return null;


  const chip = (label: string, n: number, color: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 54, padding: "4px 8px" }}>
      <div style={{ fontSize: 18, fontWeight: 600, color, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>{n}</div>
      <div style={{ fontSize: 9, color: "#7A8090", marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: 44,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        display: "flex",
        alignItems: "stretch",
        gap: 0,
        padding: "10px 12px",
        background: "rgba(10,12,18,0.72)",
        backdropFilter: "blur(18px) saturate(140%)",
        WebkitBackdropFilter: "blur(18px) saturate(140%)",
        border: "1px solid rgba(47,224,200,0.14)",
        borderRadius: 14,
        boxShadow: "0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset",
        maxWidth: "min(920px, calc(100vw - 32px))",
        pointerEvents: "auto",
      }}
    >
      {/* Header pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 14, borderRight: "1px solid #1A1D24" }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "#2FE0C820", border: "1px solid #2FE0C840", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Activity size={13} color="#2FE0C8" />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 10.5, color: "#F5F6F8", fontWeight: 600, letterSpacing: "0.06em" }}>TASK INTELLIGENCE</div>
          <div style={{ fontSize: 9, color: "#5C616B", fontFamily: "'JetBrains Mono', monospace" }}>LIVE · {s.total} tracked</div>
        </div>
      </div>

      {/* Counts */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
        {chip("Running", s.running, "#2FE0C8")}
        {chip("Review", s.review, "#F59E0B")}
        {chip("Queued", s.queued, "#94A3B8")}
        {chip("Stuck", s.stuck, "#EF4444")}
        {chip("Today", s.doneToday, "#22C55E")}
      </div>

      {/* Recent feed */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 3, paddingLeft: 12, paddingRight: 12, borderLeft: "1px solid #1A1D24", minWidth: 220, maxWidth: 280 }}>
        {s.recent.length === 0 && (
          <div style={{ fontSize: 10.5, color: "#5C616B" }}>No task activity yet.</div>
        )}
        {s.recent.map((j: Job) => (
          <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLOR[j.status], flexShrink: 0 }} />
            <span style={{ fontSize: 10.5, color: "#C4C8D0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{j.title}</span>
            <span style={{ fontSize: 9, color: STATUS_COLOR[j.status], fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{j.status}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 10, borderLeft: "1px solid #1A1D24" }}>
        <a href="/analytics" title="Open full analytics" style={pillBtn("#2FE0C8")}>
          <Activity size={11} /> Analytics <ArrowRight size={10} />
        </a>
        <a href="/jobs" title="Open task board" style={pillBtn("#F59E0B")}>
          <Clock size={11} /> Board
        </a>
        {s.review > 0 && (
          <a href="/jobs?filter=review" style={pillBtn("#F5A623")}>
            <AlertTriangle size={11} /> {s.review} approvals
          </a>
        )}
        {s.stuck > 0 && (
          <a href="/jobs?filter=stuck" style={pillBtn("#EF4444")}>
            <AlertTriangle size={11} /> {s.stuck} stuck
          </a>
        )}
        {s.doneToday > 0 && (
          <span style={{ ...pillBtn("#22C55E"), pointerEvents: "none" }}>
            <CheckCircle2 size={11} /> {s.doneToday} done
          </span>
        )}
      </div>
    </div>
  );
}

function pillBtn(color: string): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 9px",
    background: `${color}14`,
    border: `1px solid ${color}44`,
    borderRadius: 6,
    color,
    fontSize: 10.5,
    fontWeight: 500,
    textDecoration: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}
