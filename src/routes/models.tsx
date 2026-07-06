import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { ModulePage, StatusPill } from "@/components/shell/ModulePage";
import { modelsRepo, type Model } from "@/lib/repo";
import { Brain } from "lucide-react";

export const Route = createFileRoute("/models")({
  head: () => ({ meta: [{ title: "Models · Digi OS" }, { name: "description", content: "Manage AI models and providers." }] }),
  component: () => (
    <AppShell>
      <ModulePage<Model>
        title="Models"
        description="Manage AI providers, API keys, local models, and routing defaults."
        icon={<Brain size={20} color="#F472B6" />}
        accent="#F472B6"
        repo={modelsRepo}
        fields={[
          { key: "name", label: "Display Name", placeholder: "e.g. GPT-5 Fast" },
          { key: "provider", label: "Provider", type: "select", options: ["OpenAI", "Google", "DeepSeek", "OpenRouter", "Ollama", "Custom"] },
          { key: "modelId", label: "Model ID", placeholder: "e.g. gpt-5" },
          { key: "apiKey", label: "API Key", placeholder: "sk-..." },
          { key: "baseURL", label: "Base URL", placeholder: "https://api.example.com/v1" },
          { key: "tags", label: "Tags", placeholder: "cloud, premium" },
          { key: "notes", label: "Notes", type: "textarea" },
          { key: "active", label: "Active", type: "toggle" },
          { key: "isDefault", label: "Set as default", type: "toggle" },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "provider", label: "Provider" },
          { key: "modelId", label: "Model ID" },
          { key: "tags", label: "Tags" },
          { key: "active", label: "Status", render: (r) => <StatusPill label={r.active ? "Active" : "Off"} color={r.active ? "#34D399" : "#5C616B"} /> },
        ]}
      />
    </AppShell>
  ),
});
