import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { ModulePage, StatusPill } from "@/components/shell/ModulePage";
import { toolsRepo, type Tool } from "@/lib/repo";
import { Wrench } from "lucide-react";

export const Route = createFileRoute("/tools")({
  head: () => ({ meta: [{ title: "Tools · Digi OS" }] }),
  component: () => (
    <AppShell>
      <ModulePage<Tool>
        title="Tools"
        description="Catalog of API, local, MCP, script, and browser tools available to agents."
        icon={<Wrench size={20} color="#7DD3FC" />}
        accent="#7DD3FC"
        repo={toolsRepo}
        fields={[
          { key: "name", label: "Name" },
          { key: "type", label: "Type", type: "select", options: ["api", "local", "mcp", "script", "browser", "file"] },
          { key: "provider", label: "Provider" },
          { key: "endpoint", label: "Endpoint / Command" },
          { key: "config", label: "Config JSON", type: "textarea", placeholder: '{ "key": "value" }' },
          { key: "tags", label: "Tags" },
          { key: "active", label: "Active", type: "toggle" },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "type", label: "Type" },
          { key: "provider", label: "Provider" },
          { key: "active", label: "Status", render: (r) => <StatusPill label={r.active ? "Active" : "Off"} color={r.active ? "#34D399" : "#5C616B"} /> },
        ]}
      />
    </AppShell>
  ),
});
