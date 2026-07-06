import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { Brain, Database, Zap, Bot, Workflow } from "lucide-react";
import { skillsRepo, memoryRepo, agentsRepo, workflowsRepo, useRepo } from "@/lib/repo";

function BrainPage() {
  const skills = useRepo(skillsRepo);
  const memory = useRepo(memoryRepo);
  const agents = useRepo(agentsRepo);
  const wf = useRepo(workflowsRepo);

  const stat = (label: string, value: number, color: string, to: string, Icon: any) => (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div style={{ padding: 20, background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 10, transition: "all .2s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Icon size={16} color={color} />
          <span style={{ fontSize: 11, color: "#7A8090", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{label}</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 600, color: "#F5F6F8" }}>{value}</div>
      </div>
    </Link>
  );

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #1A1D24", display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: "#F59E0B18", border: "1px solid #F59E0B40", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px #F59E0B20" }}>
          <Brain size={20} color="#F59E0B" />
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#F5F6F8", margin: 0 }}>Brain</h1>
          <p style={{ fontSize: 12, color: "#7A8090", margin: "3px 0 0" }}>Intelligence orchestration — memory, skills, agents, and reasoning.</p>
        </div>
      </div>
      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, maxWidth: 900 }}>
        {stat("Skills", skills.length, "#3B82F6", "/skills", Zap)}
        {stat("Memory", memory.length, "#06B6D4", "/memory", Database)}
        {stat("Agents", agents.length, "#A78BFA", "/agents", Bot)}
        {stat("Workflows", wf.length, "#8B5CF6", "/workflows", Workflow)}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/brain")({
  head: () => ({ meta: [{ title: "Brain · Digi OS" }] }),
  component: () => <AppShell><BrainPage /></AppShell>,
});
