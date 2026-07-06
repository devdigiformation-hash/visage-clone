import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { ModulePage, StatusPill } from "@/components/shell/ModulePage";
import { workflowsRepo, type Workflow as WF } from "@/lib/repo";
import { Workflow, Sparkles } from "lucide-react";

export const Route = createFileRoute("/workflows")({
  head: () => ({ meta: [{ title: "Workflows · Digi OS" }] }),
  component: () => (
    <AppShell>
      <ModulePage<WF>
        title="Workflows"
        description="Automation flows and task orchestration definitions."
        icon={<Workflow size={20} color="#8B5CF6" />}
        accent="#8B5CF6"
        repo={workflowsRepo}
        fields={[
          { key: "name", label: "Name" },
          { key: "trigger", label: "Trigger", type: "select", options: ["manual", "schedule", "webhook", "event"] },
          { key: "steps", label: "Steps (one per line)", type: "textarea" },
          { key: "status", label: "Status", type: "select", options: ["draft", "active", "archived"] },
          { key: "notes", label: "Notes", type: "textarea" },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "trigger", label: "Trigger" },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} color={r.status === "active" ? "#34D399" : r.status === "draft" ? "#F5A623" : "#5C616B"} /> },
        ]}
      />
    </AppShell>
  ),
});
