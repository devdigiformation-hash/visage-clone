import { useEffect, useMemo, useState } from "react";
import { jobsRepo, useRepo } from "@/lib/repo";

export function TaskStrip() {
  const jobs = useRepo(jobsRepo);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const stats = useMemo(() => {
    const running   = jobs.filter(j => j.status === "running").length;
    const pending   = jobs.filter(j => j.status === "queued" || j.status === "pending").length;
    const review    = jobs.filter(j => j.status === "review").length;
    const stuck     = jobs.filter(j => j.status === "failed" || j.status === "blocked").length;
    const completed = jobs.filter(j => j.status === "completed" || j.status === "approved").length;
    return { running, pending, review, stuck, completed };
  }, [jobs]);

  if (!mounted) return null;

  const items = [
    { label: "Active",   n: stats.running,   color: "#2FE0C8" },
    { label: "Pending",  n: stats.pending,   color: "#94A3B8" },
    { label: "Review",   n: stats.review,    color: "#F59E0B" },
    { label: "Stuck",    n: stats.stuck,     color: "#EF4444" },
    { label: "Done",     n: stats.completed, color: "#22C55E" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 46,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "2px 6px",
        pointerEvents: "auto",
        maxWidth: "min(760px, calc(100vw - 40px))",
      }}
    >
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
              letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1,
            }}
          >
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}
