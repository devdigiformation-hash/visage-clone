import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jobsRepo, useRepo, type Job, type JobStatus } from "@/lib/repo";
import { Activity, ArrowRight } from "lucide-react";

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

export function TaskStrip() {
  const jobs = useRepo(jobsRepo);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const stats = useMemo(() => {
    const running   = jobs.filter(j => j.status === "running");
    const pending   = jobs.filter(j => j.status === "queued" || j.status === "pending" || j.status === "review");
    const stuck     = jobs.filter(j => j.status === "failed" || j.status === "blocked");
    const completed = jobs.filter(j => j.status === "completed" || j.status === "approved");
    const current   = running[0]
      ?? jobs.find(j => j.status === "review")
      ?? jobs.find(j => j.status === "failed" || j.status === "blocked")
      ?? jobs.find(j => j.status === "queued" || j.status === "pending");
    return {
      total: jobs.length,
      running: running.length,
      pending: pending.length,
      stuck: stuck.length,
      completed: completed.length,
      current,
    };
  }, [jobs]);

  if (!mounted) return null;

  const items: { label: string; n: number; color: string }[] = [
    { label: "Total",     n: stats.total,     color: "#F5F6F8" },
    { label: "Running",   n: stats.running,   color: "#2FE0C8" },
    { label: "Pending",   n: stats.pending,   color: "#94A3B8" },
    { label: "Stuck",     n: stats.stuck,     color: "#EF4444" },
    { label: "Completed", n: stats.completed, color: "#22C55E" },
  ];

  const cur = stats.current;
  const curColor = cur ? STATUS_COLOR[cur.status] : "#5C616B";
  const stepInfo = cur && cur.totalSteps
    ? `step ${Math.max(1, cur.step || 1)}/${cur.totalSteps}`
    : null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 46,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        pointerEvents: "auto",
        maxWidth: "min(760px, calc(100vw - 40px))",
      }}
    >
      {/* Header row: label + open board */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'JetBrains Mono', monospace" }}>
        <Activity size={11} color="#2FE0C8" style={{ opacity: 0.9 }} />
        <span style={{ fontSize: 9.5, color: "#7A8090", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Task Tracking
        </span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#2A2E38" }} />
        <span style={{ fontSize: 9.5, color: "#5C616B", letterSpacing: "0.14em" }}>
          {stats.total} TRACKED
        </span>
        <Link
          to="/jobs"
          style={{
            marginLeft: 4,
            display: "inline-flex", alignItems: "center", gap: 3,
            fontSize: 9.5, color: "#2FE0C8", textDecoration: "none",
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}
          title="Open task board"
        >
          Board <ArrowRight size={9} />
        </Link>
      </div>

      {/* Counts row */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "2px 6px" }}>
        {items.map((it) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: it.color,
                boxShadow: `0 0 6px ${it.color}80`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12, fontWeight: 600, color: it.color,
                fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
              }}
            >
              {it.n}
            </span>
            <span
              style={{
                fontSize: 9, color: "#7A8090",
                letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1,
              }}
            >
              {it.label}
            </span>
          </div>
        ))}
      </div>

      {/* Current task line */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 10.5, color: "#8A909C",
        fontFamily: "'JetBrains Mono', monospace",
        maxWidth: "100%",
      }}>
        {cur ? (
          <>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: curColor,
              boxShadow: `0 0 6px ${curColor}`,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: 9, color: curColor, letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>{STATUS_LABEL[cur.status]}</span>
            <span style={{
              color: "#C4C8D0",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              maxWidth: 280,
            }}>{cur.title}</span>
            {cur.agent && (
              <span style={{ color: "#5C616B" }}>· {cur.agent}</span>
            )}
            {stepInfo && (
              <span style={{ color: "#5C616B" }}>· {stepInfo}</span>
            )}
          </>
        ) : (
          <span style={{ color: "#5C616B" }}>· NO ACTIVE TASKS ·</span>
        )}
      </div>
    </div>
  );
}
