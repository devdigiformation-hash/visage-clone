import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Brain, Bot, LayoutDashboard, Users, MessageSquare, Zap, Wrench, Workflow,
  Layers, BarChart2, Settings, Heart, Database, Command, Plug, Activity,
  FolderTree, BookOpen, Sparkles, ChevronDown,
} from "lucide-react";
import { ModuleErrorBoundary } from "./ModuleErrorBoundary";

export const NAV = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard, color: "#3B82F6" },
  { to: "/command", label: "Task Analytics", Icon: Command, color: "#2FE0C8" },
  { to: "/town", label: "Agent Town", Icon: Users, color: "#F43F5E" },
  { to: "/brain", label: "Brain", Icon: Brain, color: "#F59E0B" },
] as const;

type ModItem = { to: string; label: string; Icon: any; color: string };
type ModGroup = { id: string; label: string; defaultOpen: boolean; items: ModItem[] };

/**
 * MODULES grouped by purpose. Rendering iterates MOD_GROUPS; the flat MODS
 * export is preserved so anything importing the old shape (labels, colours,
 * highlight lookups) keeps working.
 */
export const MOD_GROUPS: ModGroup[] = [
  {
    id: "intelligence",
    label: "Intelligence",
    defaultOpen: true,
    items: [
      { to: "/knowledge", label: "Knowledge Base", Icon: BookOpen, color: "#2FE0C8" },
      { to: "/tools",     label: "Tools",          Icon: Wrench,   color: "#7DD3FC" },
      { to: "/skills",    label: "Skills",         Icon: Zap,      color: "#3B82F6" },
      { to: "/models",    label: "Models",         Icon: Brain,    color: "#F472B6" },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    defaultOpen: true,
    items: [
      { to: "/agents",    label: "Agents",    Icon: Bot,      color: "#A78BFA" },
      { to: "/bots",      label: "Bots",      Icon: Sparkles,  color: "#F472B6" },
      { to: "/workflows", label: "Workflows", Icon: Workflow,  color: "#8B5CF6" },
      { to: "/jobs",      label: "Core Jobs", Icon: Layers,    color: "#2FE0C8" },
    ],
  },
  {
    id: "connectivity",
    label: "Connectivity",
    defaultOpen: true,
    items: [
      { to: "/channels",     label: "Channels",     Icon: MessageSquare, color: "#22C55E" },
      { to: "/integrations", label: "Integrations", Icon: Plug,          color: "#F5A623" },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    defaultOpen: false,
    items: [
      { to: "/workspaces", label: "Workspaces", Icon: FolderTree, color: "#F5A623" },
      { to: "/memory",     label: "Memory",     Icon: Database,   color: "#06B6D4" },
      { to: "/soul",       label: "Soul",       Icon: Heart,      color: "#EC4899" },
    ],
  },
  {
    id: "observability",
    label: "Observability",
    defaultOpen: false,
    items: [
      { to: "/analytics", label: "Analytics",    Icon: BarChart2, color: "#06B6D4" },
      { to: "/logs",      label: "Logs & Traces", Icon: Activity, color: "#2FE0C8" },
    ],
  },
  {
    id: "system",
    label: "System",
    defaultOpen: false,
    items: [
      { to: "/settings", label: "Settings", Icon: Settings, color: "#EF4444" },
    ],
  },
];

// Flat list preserved for lookups (label/color resolution, page-title
// derivation, and any consumer that iterated the old MODS array).
export const MODS: ModItem[] = MOD_GROUPS.flatMap((g) => g.items);


export function ShellSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  // Each group is collapsible. A group that contains the active route is
  // forced open so users are never scrolling to find where they are.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOD_GROUPS.map((g) => [g.id, g.defaultOpen])),
  );
  const toggle = (id: string) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

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

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }} className="sidebar-scroll">
        <GroupHeader label="Core Apps" />
        {NAV.map((n) => (
          <NavRow key={n.to} to={n.to} label={n.label} Icon={n.Icon} color={n.color} active={active(n.to)} />
        ))}

        {MOD_GROUPS.map((group) => {
          const groupHasActive = group.items.some((it) => active(it.to));
          const isOpen = openGroups[group.id] || groupHasActive;
          return (
            <div key={group.id} style={{ marginTop: 6 }}>
              <button
                type="button"
                onClick={() => toggle(group.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "6px 8px 4px", background: "transparent", border: "none",
                  cursor: "pointer", textAlign: "left",
                }}
                aria-expanded={isOpen}
                title={isOpen ? `Collapse ${group.label}` : `Expand ${group.label}`}
              >
                <span style={{
                  fontSize: 9.5, letterSpacing: "0.16em", color: "#5C616B",
                  fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
                }}>
                  {group.label}
                </span>
                <ChevronDown
                  size={11}
                  style={{
                    color: "#4A4F5C",
                    transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.18s ease",
                  }}
                />
              </button>
              {isOpen && group.items.map((m) => (
                <NavRow key={m.to} to={m.to} label={m.label} Icon={m.Icon} color={m.color} active={active(m.to)} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GroupHeader({ label }: { label: string }) {
  return (
    <div style={{
      padding: "6px 8px 4px", fontSize: 9.5, letterSpacing: "0.16em",
      color: "#5C616B", fontFamily: "'JetBrains Mono', monospace",
      textTransform: "uppercase",
    }}>
      {label}
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

export function AppShell({ children, moduleLabel }: { children: ReactNode; moduleLabel?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const label = moduleLabel
    ?? [...NAV, ...MODS].find((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to)))?.label;
  return (
    <div style={{
      display: "flex", width: "100vw", height: "100vh", overflow: "hidden",
      background: "#0A0C12", color: "#F5F6F8",
    }}>
      <ShellSidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <ModuleErrorBoundary label={label}>
          {children}
        </ModuleErrorBoundary>
      </div>
    </div>
  );
}
