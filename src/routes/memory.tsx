import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { ModulePage } from "@/components/shell/ModulePage";
import { memoryRepo, type MemoryItem } from "@/lib/repo";
import { Database } from "lucide-react";

export const Route = createFileRoute("/memory")({
  head: () => ({ meta: [{ title: "Memory · Digi OS" }] }),
  component: () => (
    <AppShell>
      <ModulePage<MemoryItem>
        title="Memory"
        description="Long-term memory entries — user, system, and project scoped."
        icon={<Database size={20} color="#06B6D4" />}
        accent="#06B6D4"
        repo={memoryRepo}
        fields={[
          { key: "title", label: "Title" },
          { key: "scope", label: "Scope", type: "select", options: ["user", "system", "project"] },
          { key: "content", label: "Content", type: "textarea" },
          { key: "tags", label: "Tags" },
        ]}
        columns={[
          { key: "title", label: "Title" },
          { key: "scope", label: "Scope" },
          { key: "tags", label: "Tags" },
        ]}
      />
    </AppShell>
  ),
});
