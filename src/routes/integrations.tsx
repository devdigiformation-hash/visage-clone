import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { ModulePage, StatusPill } from "@/components/shell/ModulePage";
import { integrationsRepo, type Integration } from "@/lib/repo";
import { Plug } from "lucide-react";

export const Route = createFileRoute("/integrations")({
  head: () => ({ meta: [{ title: "Integrations · Digi OS" }] }),
  component: () => (
    <AppShell>
      <ModulePage<Integration>
        title="Integrations"
        description="External services, APIs, and providers connected to the system."
        icon={<Plug size={20} color="#F5A623" />}
        accent="#F5A623"
        repo={integrationsRepo}
        fields={[
          { key: "name", label: "Name" },
          { key: "category", label: "Category", placeholder: "AI Provider, CRM, Storage..." },
          { key: "apiKey", label: "API Key" },
          { key: "endpoint", label: "Endpoint" },
          { key: "status", label: "Status", type: "select", options: ["connected", "disconnected", "error"] },
          { key: "notes", label: "Notes", type: "textarea" },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} color={r.status === "connected" ? "#34D399" : r.status === "error" ? "#FF5C5C" : "#5C616B"} /> },
        ]}
      />
    </AppShell>
  ),
});
