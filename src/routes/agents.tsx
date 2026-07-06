import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { ModulePage, StatusPill } from "@/components/shell/ModulePage";
import { agentsRepo, type Agent } from "@/lib/repo";
import { Bot, Sparkles } from "lucide-react";

export const Route = createFileRoute("/agents")({
  head: () => ({ meta: [{ title: "Agents · Digi OS" }] }),
  component: () => (
    <AppShell>
      <ModulePage<Agent>
        title="Agents"
        description="Registry of agents with linked models, tools, and skills."
        icon={<Bot size={20} color="#A78BFA" />}
        accent="#A78BFA"
        repo={agentsRepo}
        extraActions={
          <Link to="/agents/library" style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px",
            background: "rgba(167,139,250,0.10)", border: "1px solid rgba(167,139,250,0.4)",
            borderRadius: 8, color: "#A78BFA", fontSize: 12, textDecoration: "none",
          }}><Sparkles size={13}/> Library</Link>
        }
        fields={[
          { key: "name", label: "Name" },
          { key: "role", label: "Role / Purpose", type: "textarea" },
          { key: "modelId", label: "Default Model ID" },
          { key: "toolIds", label: "Tool IDs (comma)" },
          { key: "skillIds", label: "Skill IDs (comma)" },
          { key: "prompt", label: "System Prompt", type: "textarea" },
          { key: "active", label: "Active", type: "toggle" },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "role", label: "Role" },
          { key: "modelId", label: "Model" },
          { key: "active", label: "Status", render: (r) => <StatusPill label={r.active ? "Active" : "Off"} color={r.active ? "#34D399" : "#5C616B"} /> },
        ]}
      />
    </AppShell>
  ),
});
