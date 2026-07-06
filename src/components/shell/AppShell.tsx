import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Brain, Bot, LayoutDashboard, Users, MessageSquare, Zap, Wrench, Workflow,
  Layers, BarChart2, Settings, Heart, Database, Command, Plug, Activity, FolderTree, BookOpen, Sparkles,
} from "lucide-react";

export const NAV = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard, color: "#3B82F6" },
  { to: "/command", label: "AI Command Center", Icon: Command, color: "#2FE0C8" },
  { to: "/town", label: "Agent Town", Icon: Users, color: "#F43F5E" },
  { to: "/brain", label: "Brain", Icon: Brain, color: "#F59E0B" },
] as const;

export const MODS = [
  { to: "/knowledge", label: "Knowledge Base", Icon: BookOpen, color: "#2FE0C8" },
  { to: "/tools", label: "Tools", Icon: Wrench, color: "#7DD3FC" },
  { to: "/skills", label: "Skills", Icon: Zap, color: "#3B82F6" },
  { to: "/models", label: "Models", Icon: Brain, color: "#F472B6" },
  { to: "/channels", label: "Channels", Icon: MessageSquare, color: "#22C55E" },
  { to: "/agents", label: "Agents", Icon: Bot, color: "#A78BFA" },
  { to: "/bots", label: "Bots", Icon: Sparkles, color: "#F472B6" },
  { to: "/workflows", label: "Workflows", Icon: Workflow, color: "#8B5CF6" },
  { to: "/jobs", label: "Core Jobs", Icon: Layers, color: "#2FE0C8" },
  { to: "/integrations", label: "Integrations", Icon: Plug, color: "#F5A623" },
  { to: "/workspaces", label: "Workspaces", Icon: FolderTree, color: "#F5A623" },
  { to: "/memory", label: "Memory", Icon: Database, color: "#06B6D4" },
  { to: "/soul", label: "Soul", Icon: Heart, color: "#EC4899" },
  { to: "/analytics", label: "Analytics", Icon: BarChart2, color: "#06B6D4" },
  { to: "/logs", label: "Logs & Traces", Icon: Activity, color: "#2FE0C8" },
  { to: "/settings", label: "Settings", Icon: Settings, color: "#EF4444" },
] as const;

export function ShellSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div style={{
      width: 220, flexShrink: 0, display: "flex", flexDirection: "column",
      background: "#090B11", borderRight: "1px solid #1A1D24", minHeight: 0,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ padding: "12px 14px 8px", flexShrink: 0 }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.14em", color: "#5C616B",
          fontFamily: "'JetBrains Mono', monospace",
        }}>DIGI · OS</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }} className="custom-scroll">
        <div style={{ padding: "6px 8px 4px", fontSize: 9.5, letterSpacing: "0.16em", color: "#5C616B", fontFamily: "'JetBrains Mono', monospace" }}>CORE APPS</div>
        {NAV.map((n) => <NavRow key={n.to} to={n.to} label={n.label} Icon={n.Icon} color={n.color} active={active(n.to)} />)}

        <div style={{ padding: "10px 8px 4px", fontSize: 9.5, letterSpacing: "0.16em", color: "#5C616B", fontFamily: "'JetBrains Mono', monospace" }}>MODULES</div>
        {MODS.map((m) => <NavRow key={m.to} to={m.to} label={m.label} Icon={m.Icon} color={m.color} active={active(m.to)} />)}
      </div>
    </div>
  );
}

function NavRow({ to, label, Icon, color, active }: { to: string; label: string; Icon: any; color: string; active: boolean }) {
  return (
    <Link to={to} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
      borderRadius: 6, marginBottom: 2, textDecoration: "none",
      background: active ? "rgba(47,224,200,0.10)" : "transparent",
      borderLeft: `2px solid ${active ? color : "transparent"}`,
      transition: "all .2s ease",
    }}>
      <Icon size={13} style={{ color, opacity: active ? 1 : 0.7, filter: active ? `drop-shadow(0 0 4px ${color}80)` : "none", flexShrink: 0 }} />
      <span style={{ fontSize: 11.5, color: active ? "#F5F6F8" : "#8A909C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: "flex", width: "100vw", height: "100vh", overflow: "hidden",
      background: "#0A0C12", color: "#F5F6F8",
    }}>
      <ShellSidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
