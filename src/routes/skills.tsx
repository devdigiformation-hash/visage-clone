import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { ModulePage, StatusPill } from "@/components/shell/ModulePage";
import { skillsRepo, type Skill } from "@/lib/repo";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/skills")({
  head: () => ({ meta: [{ title: "Skills · Digi OS" }, { name: "description", content: "Skill library — prompts, tools, code, and automation skills." }] }),
  component: () => (
    <AppShell>
      <ModulePage<Skill>
        title="Skills"
        description="Reusable capabilities assignable to agents and workflows."
        icon={<Zap size={20} color="#3B82F6" />}
        accent="#3B82F6"
        repo={skillsRepo}
        fields={[
          { key: "name", label: "Name" },
          { key: "category", label: "Category", placeholder: "Writing, Finance, ..." },
          { key: "type", label: "Type", type: "select", options: ["prompt", "tool", "code", "automation", "markdown"] },
          { key: "content", label: "Content / Instructions", type: "textarea", placeholder: "Prompt, markdown, or config..." },
          { key: "tags", label: "Tags" },
          { key: "active", label: "Active", type: "toggle" },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          { key: "type", label: "Type" },
          { key: "active", label: "Status", render: (r) => <StatusPill label={r.active ? "Active" : "Off"} color={r.active ? "#34D399" : "#5C616B"} /> },
        ]}
      />
    </AppShell>
  ),
});
