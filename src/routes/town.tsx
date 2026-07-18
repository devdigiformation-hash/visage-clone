import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Users, Bot, X } from "lucide-react";
import { agentsRepo, useRepo } from "@/lib/repo";

function TownPage() {
  const agents = useRepo(agentsRepo);
  const router = useRouter();
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "auto", background: "#0A0C12", color: "#F5F6F8", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #1A1D24", display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: "#F43F5E18", border: "1px solid #F43F5E40", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px #F43F5E20" }}>
          <Users size={20} color="#F43F5E" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#F5F6F8", margin: 0 }}>Agent Town</h1>
          <p style={{ fontSize: 12, color: "#7A8090", margin: "3px 0 0" }}>Overview of every agent in the registry.</p>
        </div>
        <Link to="/agents" style={{ padding: "7px 14px", background: "#A78BFA20", border: "1px solid #A78BFA60", borderRadius: 6, color: "#A78BFA", textDecoration: "none", fontSize: 12 }}>Manage agents →</Link>
        <button
          type="button"
          onClick={() => { try { router.history.back(); } catch { router.navigate({ to: "/" }); } }}
          aria-label="Close Agent Town"
          title="Close"
          style={{ width: 32, height: 32, borderRadius: 8, background: "#12151C", border: "1px solid #1A1D24", color: "#8A909C", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <X size={16} />
        </button>
      </div>
      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {agents.map((a) => (
          <div key={a.id} style={{ padding: 16, background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#A78BFA18", border: "1px solid #A78BFA40", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={15} color="#A78BFA" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#F5F6F8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                <div style={{ fontSize: 10, color: a.active ? "#34D399" : "#5C616B", fontFamily: "'JetBrains Mono', monospace" }}>{a.active ? "ACTIVE" : "IDLE"}</div>
              </div>
            </div>
            <p style={{ fontSize: 11.5, color: "#8A909C", margin: 0, lineHeight: 1.5 }}>{a.role || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/town")({
  head: () => ({ meta: [{ title: "Agent Town · Digi OS" }] }),
  component: TownPage,
});
