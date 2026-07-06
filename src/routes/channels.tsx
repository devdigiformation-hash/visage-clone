import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { ModulePage, StatusPill } from "@/components/shell/ModulePage";
import { channelsRepo, type Channel } from "@/lib/repo";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/channels")({
  head: () => ({ meta: [{ title: "Channels · Digi OS" }] }),
  component: () => (
    <AppShell>
      <ModulePage<Channel>
        title="Channels"
        description="Communication channels — WhatsApp, email, Telegram, web, webhooks."
        icon={<MessageSquare size={20} color="#22C55E" />}
        accent="#22C55E"
        repo={channelsRepo}
        fields={[
          { key: "name", label: "Name" },
          { key: "type", label: "Type", type: "select", options: ["whatsapp", "email", "telegram", "web", "webhook", "custom"] },
          { key: "credentials", label: "Credentials / Token", type: "textarea" },
          { key: "agentId", label: "Bound Agent ID" },
          { key: "active", label: "Active", type: "toggle" },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "type", label: "Type" },
          { key: "active", label: "Status", render: (r) => <StatusPill label={r.active ? "Connected" : "Off"} color={r.active ? "#34D399" : "#5C616B"} /> },
        ]}
      />
    </AppShell>
  ),
});
