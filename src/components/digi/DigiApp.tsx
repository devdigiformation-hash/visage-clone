// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Terminal,
  Users,
  MessageCircle,
  BrainCircuit,
  FolderKanban,
  UserCog,
  CreditCard,
  ScrollText,
  Settings,
  Brain,
  Heart,
  Zap,
  Mic,
  Send,
  Circle,
} from "lucide-react";
import { MemoryDialog } from "./MemoryDialog";
import { SoulDialog } from "./SoulDialog";
import { SkillsDialog } from "./SkillsDialog";
import { SettingsDialog } from "./SettingsDialog";

/* ---------------- Sidebar ---------------- */

const NAV_CORE = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "command", label: "AI Command Center", icon: Terminal },
  { id: "agents", label: "Agent Town", icon: Users },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "brain", label: "Brain", icon: BrainCircuit },
];

const NAV_MODULES = [
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "users", label: "Users", icon: UserCog },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "logs", label: "Logs", icon: ScrollText },
];

function LeftSidebar({ active, onSelect, onOpenSettings }) {
  const Item = ({ item }) => {
    const Icon = item.icon;
    const isActive = active === item.id;
    return (
      <button
        onClick={() => onSelect(item.id)}
        className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
          isActive
            ? "bg-white/[0.04] text-white"
            : "text-white/50 hover:text-white hover:bg-white/[0.03]"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r bg-[#2FE0C8] shadow-[0_0_8px_#2FE0C8]" />
        )}
        <Icon size={16} className={isActive ? "text-[#2FE0C8]" : ""} />
        <span className="font-medium tracking-wide">{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="w-[240px] shrink-0 h-full flex flex-col border-r border-white/[0.06] bg-[#0A0B0F]/80 backdrop-blur-xl">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#2FE0C8]/30 to-[#8B7CF6]/30 border border-white/10 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#2FE0C8] to-[#8B7CF6] shadow-[0_0_16px_rgba(47,224,200,0.7)]" />
        </div>
        <div className="leading-tight">
          <div className="text-white font-semibold text-sm tracking-wider">DIGI</div>
          <div className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Business OS</div>
        </div>
      </div>

      {/* Scroll content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-white/30">
            Core Apps
          </div>
          <div className="space-y-1">
            {NAV_CORE.map((i) => <Item key={i.id} item={i} />)}
          </div>
        </div>
        <div>
          <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-white/30">
            Modules
          </div>
          <div className="space-y-1">
            {NAV_MODULES.map((i) => <Item key={i.id} item={i} />)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-3 py-3 flex items-center justify-between">
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <Settings size={16} />
        </button>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/60">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#2FE0C8] opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2FE0C8]" />
          </span>
          System Online
        </div>
      </div>
    </aside>
  );
}

/* ---------------- Central Orb + Wires ---------------- */

function CentralStage({ onOpen }) {
  // Icons positioned in a vertical column on the left of the orb.
  // SVG viewBox: 600x520. Orb center at (420, 260). Icons at x=90.
  const orbCx = 420;
  const orbCy = 260;
  const iconX = 90;
  const nodes = [
    { id: "memory", label: "Memory", Icon: Brain,     y: 60,  color: "#2FE0C8" },
    { id: "soul",   label: "Soul",   Icon: Heart,     y: 190, color: "#F43F5E" },
    { id: "skills", label: "Skills", Icon: Zap,       y: 320, color: "#F5B733" },
    { id: "settings",label:"Settings",Icon: Settings, y: 450, color: "#8B7CF6" },
  ];

  return (
    <div className="relative flex-1 min-w-0 h-full overflow-hidden">
      {/* backdrop grid + glow */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(47,224,200,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(139,124,246,0.10),transparent_60%)]" />

      {/* Header strip */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Operations Status</div>
          <div className="text-white text-xl font-semibold tracking-wide mt-1">AI Core · Active</div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-white/50">
          <span className="px-2 py-1 rounded-md border border-white/10 bg-white/[0.03]">CPU 12%</span>
          <span className="px-2 py-1 rounded-md border border-white/10 bg-white/[0.03]">MEM 3.4G</span>
          <span className="px-2 py-1 rounded-md border border-white/10 bg-white/[0.03] text-[#2FE0C8]">
            AGENTS 24
          </span>
        </div>
      </div>

      {/* SVG stage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 600 520"
          className="w-full h-full max-w-[900px] max-h-[620px]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="orbCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7FF3E1" stopOpacity="1" />
              <stop offset="45%" stopColor="#2FE0C8" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#8B7CF6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0A0B0F" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="orbHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2FE0C8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2FE0C8" stopOpacity="0" />
            </radialGradient>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {nodes.map((n) => (
              <linearGradient key={n.id} id={`wire-${n.id}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={n.color} stopOpacity="0.15" />
                <stop offset="50%" stopColor={n.color} stopOpacity="0.9" />
                <stop offset="100%" stopColor="#2FE0C8" stopOpacity="0.7" />
              </linearGradient>
            ))}
          </defs>

          {/* Halo rings */}
          <circle cx={orbCx} cy={orbCy} r="180" fill="url(#orbHalo)" />
          <circle
            cx={orbCx}
            cy={orbCy}
            r="150"
            fill="none"
            stroke="rgba(47,224,200,0.15)"
            strokeDasharray="2 6"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${orbCx} ${orbCy}`}
              to={`360 ${orbCx} ${orbCy}`}
              dur="40s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={orbCx}
            cy={orbCy}
            r="118"
            fill="none"
            stroke="rgba(139,124,246,0.20)"
            strokeDasharray="1 8"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`360 ${orbCx} ${orbCy}`}
              to={`0 ${orbCx} ${orbCy}`}
              dur="28s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Orb core */}
          <circle cx={orbCx} cy={orbCy} r="90" fill="url(#orbCore)" filter="url(#softGlow)">
            <animate attributeName="r" values="88;94;88" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle
            cx={orbCx}
            cy={orbCy}
            r="60"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />

          {/* Wires + endpoint dots + data packets */}
          {nodes.map((n, i) => {
            const path = `M ${iconX + 28} ${n.y + 20} C ${iconX + 140} ${n.y + 20}, ${orbCx - 160} ${orbCy}, ${orbCx - 90} ${orbCy}`;
            const pathId = `wirepath-${n.id}`;
            return (
              <g key={n.id}>
                <path
                  id={pathId}
                  d={path}
                  fill="none"
                  stroke={`url(#wire-${n.id})`}
                  strokeWidth="1.2"
                  opacity="0.85"
                />
                {/* flowing pulse dashes */}
                <path
                  d={path}
                  fill="none"
                  stroke={n.color}
                  strokeWidth="1.2"
                  strokeDasharray="2 14"
                  opacity="0.55"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-48"
                    dur={`${2 + i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </path>
                {/* traveling data packet */}
                <circle r="2.4" fill={n.color} filter="url(#softGlow)">
                  <animateMotion dur={`${3.4 + i * 0.5}s`} repeatCount="indefinite">
                    <mpath xlinkHref={`#${pathId}`} />
                  </animateMotion>
                </circle>
                {/* orb connection dot */}
                <circle cx={orbCx - 90} cy={orbCy} r="3" fill={n.color} opacity="0.9" />
              </g>
            );
          })}
        </svg>

        {/* Floating icon buttons overlaid on the SVG */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full max-w-[900px] max-h-[620px] mx-auto">
            {nodes.map((n) => {
              // Map SVG coords (600x520) → percentages of overlay box
              const leftPct = ((iconX) / 600) * 100;
              const topPct = ((n.y) / 520) * 100;
              const Icon = n.Icon;
              return (
                <button
                  key={n.id}
                  onClick={() => onOpen(n.id)}
                  className="pointer-events-auto absolute group"
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  title={n.label}
                >
                  <div
                    className="w-[42px] h-[42px] rounded-xl border flex items-center justify-center backdrop-blur-md transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${n.color}22, rgba(255,255,255,0.02))`,
                      borderColor: `${n.color}55`,
                      boxShadow: `0 0 18px ${n.color}33, inset 0 0 8px ${n.color}22`,
                    }}
                  >
                    <Icon size={18} style={{ color: n.color }} />
                  </div>
                  <div
                    className="absolute left-1/2 -translate-x-1/2 mt-1 text-[9px] uppercase tracking-[0.2em] text-white/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                  >
                    {n.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom telemetry */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-8 py-4 flex items-center justify-between text-[11px] text-white/40 border-t border-white/[0.04] bg-black/20 backdrop-blur">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2"><Circle size={6} className="fill-[#2FE0C8] text-[#2FE0C8]" /> Voice channel armed</span>
          <span>Uplink · 42ms</span>
        </div>
        <div>DIGI OS v0.9 · build 2026.07</div>
      </div>
    </div>
  );
}

/* ---------------- Right Chat / Command Panel ---------------- */

function RightPanel() {
  const [messages, setMessages] = useState([
    { role: "system", text: "> DIGI kernel booted" },
    { role: "system", text: "> 24 agents synced · memory OK" },
    { role: "assistant", text: "Standing by. Say 'hey digi' or type a command." },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    console.log("trigger backend: send", input);
    setMessages((m) => [...m, { role: "user", text: input }]);
    setInput("");
  };

  const toggleVoice = () => {
    console.log("trigger backend: toggleVoice");
    setListening((v) => !v);
  };

  return (
    <aside className="w-[360px] shrink-0 h-full flex flex-col border-l border-white/[0.06] bg-[#0A0B0F]/80 backdrop-blur-xl">
      {/* Terminal log */}
      <div className="border-b border-white/[0.06]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
            <Terminal size={12} /> System Log
          </div>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F43F5E]/70" />
            <span className="w-2 h-2 rounded-full bg-[#F5B733]/70" />
            <span className="w-2 h-2 rounded-full bg-[#2FE0C8]/70" />
          </div>
        </div>
        <div className="px-4 pb-3 font-mono text-[11px] leading-relaxed text-white/50 max-h-[150px] overflow-y-auto space-y-0.5">
          <div><span className="text-[#2FE0C8]">[ok]</span> daemon.core → ready</div>
          <div><span className="text-[#2FE0C8]">[ok]</span> voice.gateway → armed</div>
          <div><span className="text-[#8B7CF6]">[..]</span> agent.town → syncing (24/24)</div>
          <div className="text-white/30">{"{ status: 'ONLINE', latency: 42, tokens: 1284 }"}</div>
        </div>
      </div>

      {/* Chat area */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
          <MessageCircle size={12} /> Command Chat
        </div>
        <span className="text-[10px] text-white/40">GPT-Ω · streaming</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => {
          if (m.role === "system") {
            return (
              <div key={i} className="text-[11px] font-mono text-white/40">
                {m.text}
              </div>
            );
          }
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-br from-[#2FE0C8]/20 to-[#8B7CF6]/20 border border-[#2FE0C8]/30 text-white"
                    : "bg-white/[0.03] border border-white/[0.06] text-white/85"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="relative flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl px-2 py-2 focus-within:border-[#2FE0C8]/50 focus-within:shadow-[0_0_20px_rgba(47,224,200,0.15)] transition">
          <button
            onClick={toggleVoice}
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              listening
                ? "bg-[#F43F5E]/20 text-[#F43F5E]"
                : "bg-white/[0.04] text-white/60 hover:text-[#2FE0C8]"
            }`}
            title="Voice control"
          >
            {listening && (
              <span className="absolute inset-0 rounded-xl bg-[#F43F5E]/30 animate-ping" />
            )}
            <Mic size={16} className="relative" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Speak or type a command…"
            className="flex-1 bg-transparent outline-none text-[13px] text-white placeholder:text-white/30"
          />
          <button
            onClick={handleSend}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2FE0C8] to-[#8B7CF6] text-black flex items-center justify-center hover:brightness-110 transition"
          >
            <Send size={15} />
          </button>
        </div>
        <div className="mt-2 px-1 flex items-center justify-between text-[10px] text-white/30 uppercase tracking-[0.2em]">
          <span>{listening ? "Listening…" : "Idle"}</span>
          <span>⌘ + K</span>
        </div>
      </div>
    </aside>
  );
}

/* ---------------- Root ---------------- */

export default function DigiApp() {
  const [active, setActive] = useState("dashboard");
  const [dialog, setDialog] = useState<null | "memory" | "soul" | "skills" | "settings">(null);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#08090C] text-white font-sans flex">
      {/* ambient background glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(47,224,200,0.06),transparent_60%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,124,246,0.08),transparent_60%)]" />

      <LeftSidebar
        active={active}
        onSelect={setActive}
        onOpenSettings={() => setDialog("settings")}
      />
      <CentralStage onOpen={(id) => setDialog(id)} />
      <RightPanel />

      <MemoryDialog open={dialog === "memory"} onOpenChange={(o) => !o && setDialog(null)} />
      <SoulDialog open={dialog === "soul"} onOpenChange={(o) => !o && setDialog(null)} />
      <SkillsDialog open={dialog === "skills"} onOpenChange={(o) => !o && setDialog(null)} />
      <SettingsDialog open={dialog === "settings"} onOpenChange={(o) => !o && setDialog(null)} />
    </div>
  );
}
