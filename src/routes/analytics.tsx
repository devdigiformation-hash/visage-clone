import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { BarChart2 } from "lucide-react";
import { modelsRepo, skillsRepo, toolsRepo, agentsRepo, workflowsRepo, channelsRepo, integrationsRepo, jobsRepo, useRepo } from "@/lib/repo";

function AnalyticsPage() {
  const counts = [
    { label: "Models", n: useRepo(modelsRepo).length, color: "#F472B6" },
    { label: "Skills", n: useRepo(skillsRepo).length, color: "#3B82F6" },
    { label: "Tools", n: useRepo(toolsRepo).length, color: "#7DD3FC" },
    { label: "Agents", n: useRepo(agentsRepo).length, color: "#A78BFA" },
    { label: "Workflows", n: useRepo(workflowsRepo).length, color: "#8B5CF6" },
    { label: "Channels", n: useRepo(channelsRepo).length, color: "#22C55E" },
    { label: "Integrations", n: useRepo(integrationsRepo).length, color: "#F5A623" },
    { label: "Jobs", n: useRepo(jobsRepo).length, color: "#2FE0C8" },
  ];

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #1A1D24", display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: "#06B6D418", border: "1px solid #06B6D440", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BarChart2 size={20} color="#06B6D4" />
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#F5F6F8", margin: 0 }}>Analytics</h1>
          <p style={{ fontSize: 12, color: "#7A8090", margin: "3px 0 0" }}>System-wide inventory overview.</p>
        </div>
      </div>
      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, maxWidth: 1000 }}>
        {counts.map((c) => (
          <div key={c.label} style={{ padding: 18, background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 10 }}>
            <div style={{ fontSize: 10.5, letterSpacing: "0.1em", color: "#7A8090", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 30, fontWeight: 600, color: c.color }}>{c.n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Digi OS" }] }),
  component: () => <AppShell><AnalyticsPage /></AppShell>,
});
