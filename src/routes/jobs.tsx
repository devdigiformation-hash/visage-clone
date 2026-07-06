import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { ModulePage, StatusPill } from "@/components/shell/ModulePage";
import { jobsRepo, type Job } from "@/lib/repo";
import { Layers } from "lucide-react";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Core Jobs · Digi OS" }] }),
  component: () => (
    <AppShell>
      <ModulePage<Job>
        title="Core Jobs"
        description="Task templates and running operations across the system."
        icon={<Layers size={20} color="#2FE0C8" />}
        accent="#2FE0C8"
        repo={jobsRepo}
        fields={[
          { key: "title", label: "Title" },
          { key: "agent", label: "Assigned Agent" },
          { key: "workflowId", label: "Workflow ID" },
          { key: "status", label: "Status", type: "select", options: ["pending", "running", "review", "approved", "completed"] },
          { key: "step", label: "Current Step", type: "number" },
          { key: "totalSteps", label: "Total Steps", type: "number" },
          { key: "notes", label: "Notes", type: "textarea" },
        ]}
        columns={[
          { key: "title", label: "Title" },
          { key: "agent", label: "Agent" },
          { key: "step", label: "Progress", render: (r) => `${r.step}/${r.totalSteps}` },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} color={
            r.status === "completed" ? "#34D399" : r.status === "review" ? "#F5A623" :
            r.status === "running" ? "#2FE0C8" : r.status === "approved" ? "#8B5CF6" : "#5C616B"
          } /> },
        ]}
      />
    </AppShell>
  ),
});
