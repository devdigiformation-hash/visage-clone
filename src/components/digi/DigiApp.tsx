// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain, Heart, Settings, Zap, RefreshCw, Globe,
  MessageSquare, Layers, ArrowUp, Search, Mic, Camera,
  ChevronDown, Monitor, LayoutDashboard, Bot, Users,
  Wallet, RotateCcw, PanelRightClose, PanelRightOpen,
  PanelLeftClose, PanelLeftOpen, Paperclip, Image as ImageIcon,
  Volume2, TrendingUp, BarChart2, Folder, FileText, Copy, Check,
  Workflow
} from "lucide-react";

import { SettingsDialog } from "./SettingsDialog";
import { MemoryDialog } from "./MemoryDialog";
import { SoulDialog } from "./SoulDialog";
import { SkillsDialog } from "./SkillsDialog";
import { VoiceAIPage } from "./VoiceAIPage";

import startupVideoAsset from '@/assets/digi-startup.mp4.asset.json';
const startupVideoUrl = startupVideoAsset.url;
import logoUrl from '@/assets/digi-logo.png';

// ─── Sound System (Updated to use relative paths if needed, or keeping public/audio for standard assets) ─────────
const G = `
  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.28; transform: scale(0.85); }
  }
  @keyframes breatheOrb {
    0%, 100% { transform: scale(1);     filter: brightness(1); }
    50%       { transform: scale(1.028); filter: brightness(1.12); }
  }
  @keyframes floatBlob {
    0%, 100% { transform: translate(0,0)    scale(1); }
    33%       { transform: translate(32px,-22px) scale(1.05); }
    66%       { transform: translate(-22px,16px) scale(0.95); }
  }
  @keyframes thinkDot {
    0%, 20%   { opacity: 0.2; transform: translateY(0); }
    50%        { opacity: 1;   transform: translateY(-4px); }
    80%, 100% { opacity: 0.2; transform: translateY(0); }
  }
  @keyframes orbRing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes orbRingReverse {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
  }
  @keyframes spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes barGrow {
    from { width: 0%; }
    to   { width: var(--w); }
  }

  .dot-pulse  { animation: pulseDot 1.5s ease-in-out infinite; }
  .orb-breathe{ animation: breatheOrb 4s ease-in-out infinite; }
  .blob-float { animation: floatBlob 16s ease-in-out infinite; }
  .spin       { animation: spin 1.5s linear infinite; }

  .custom-scroll::-webkit-scrollbar       { width: 3px; }
  .custom-scroll::-webkit-scrollbar-track { background: transparent; }
  .custom-scroll::-webkit-scrollbar-thumb { background: #22252D; border-radius: 2px; }
  .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(47,224,200,0.45); }

  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  .soon-badge {
    font-size: 8.5px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #34D399;
    background: rgba(52,211,153,0.1);
    border: 1px solid rgba(52,211,153,0.2);
    padding: 1px 5px;
    border-radius: 4px;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .glass-btn {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
    transition: all 0.25s ease-in-out !important;
  }
  .glass-btn:hover {
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
  }
  
  .glass-btn-active {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: rgba(47, 224, 200, 0.12) !important;
    border: 1px solid rgba(47, 224, 200, 0.25) !important;
    box-shadow: 0 0 16px rgba(47, 224, 200, 0.2) !important;
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Msg { id: number; role: "ai" | "user"; text: string; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const NODES = [
  { id: "memory",   label: "Memory",   Icon: Brain,    color: "#8B7CF6", bg: "rgba(139,124,246,0.12)", glow: "rgba(139,124,246,0.22)", badge: "HIGH" },
  { id: "soul",     label: "Soul",     Icon: Heart,    color: "#2FE0C8", bg: "rgba(47,224,200,0.12)",  glow: "rgba(47,224,200,0.22)",  badge: "HIGH" },
  { id: "skills",   label: "Skills",   Icon: Zap,      color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  glow: "rgba(59,130,246,0.22)",  badge: "MED"  },
  { id: "settings", label: "Settings", Icon: Settings, color: "#EF4444", bg: "rgba(239,68,68,0.08)",   glow: "rgba(239,68,68,0.15)",   badge: "LOW"  },
];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",        Icon: LayoutDashboard, color: "#3B82F6" }, // Blue
  { id: "ai",        label: "AI Command Center", Icon: Bot,             color: "#2FE0C8" }, // Cyan
  { id: "town",      label: "Agent Town",        Icon: Users,           color: "#F43F5E" }, // Rose
  { id: "whatsapp",  label: "WhatsApp",          Icon: MessageSquare,   color: "#22C55E" }, // Green
  { id: "brain",     label: "Brain",             Icon: Brain,           color: "#F59E0B" }, // Amber
];

const MODULES = [
  { label: "CRM",        Icon: Users,       color: "#6366F1" }, // Indigo
  { label: "Sales",      Icon: TrendingUp,  color: "#10B981" }, // Emerald
  { label: "Marketing",  Icon: BarChart2,   color: "#EC4899" }, // Pink
  { label: "Finance",    Icon: Wallet,      color: "#EAB308" }, // Yellow
  { label: "HR",         Icon: Users,       color: "#F43F5E" }, // Rose
  { label: "Projects",   Icon: Folder,      color: "#3B82F6" }, // Blue
  { label: "Automation", Icon: RefreshCw,   color: "#8B5CF6" }, // Violet
  { label: "Files",      Icon: FileText,    color: "#14B8A6" }, // Teal
  { label: "Analytics",  Icon: BarChart2,   color: "#06B6D4" }, // Cyan
  { label: "Reports",    Icon: FileText,    color: "#F97316" }, // Orange
];

const MSGS_INIT: Msg[] = [
  { id: 1, role: "ai", text: "I'm analyzing the conversation style. Considering the user's 'Hello' in English, I am determining the best response. Given the context, I will decide whether to offer a warm Urdu greeting, or a transition to English. This is important to ensure a smooth interaction with the user." },
  { id: 2, role: "ai", text: "**Responding to User Input**\n\nI'm now writing a response. The system had previously transitioned to Urdu in the conversation. However, the user simply said 'Hello'. I'm now deciding on a response, I am drafting my answer, considering the user's Input of 'Hello', to determine the best approach. My initial draft response is a warm Urdu greeting, and I'm currently assessing its appropriateness in this context." },
  { id: 3, role: "user", text: "ہیلو مسٹر باقر! کیسے مدد کر سکتا ہوں؟ آپ کی مدد کریں گے؟" },
];

const AGENTS = [
  { label: "Sales Agent (Elite)",     dot: "#34D399" },
  { label: "Support Agent (Active)",  dot: "#34D399" },
  { label: "Marketing Agent (Elite)", dot: "#34D399" },
  { label: "Finance Agent (Syncing)", dot: "#F5A623" },
  { label: "HR Agent (Idle)",         dot: "#5C616B" },
];

const ACTIVITIES = [
  { label: "New Order #12590",    time: "2m ago" },
  { label: "WhatsApp Message",    time: "3m ago" },
  { label: "AI Report Generated", time: "5m ago" },
  { label: "User Login: Admin",   time: "7m ago" },
  { label: "Project Updated",     time: "10m ago" },
];

const METRICS = [
  { label: "CPU USAGE",  pct: 24, color: "#34D399" },
  { label: "RAM USAGE",  pct: 48, color: "#34D399" },
  { label: "NETWORK",    pct: 60, color: "#F5A623" },
  { label: "DISK USAGE", pct: 55, color: "#F5A623" },
];

// ─── Layout constants (must be identical across ConnectorSVG & OperationsPanel)
const C_PAD      = 12;   // padding inside the node-map wrapper
const C_CARD_W   = 34;  // width of the node-cards column
const C_CARD_H   = 44;   // height of each node card
const C_CARD_GAP = 12;   // gap between cards
const C_LEFT_STACK_X = 46; // optical left inset for the 4 input modules
const C_GLOBE_Y_RATIO = 0.30; // raised vertical axis inside the top 80% zone (shifted up)

// Right-side outgoing wires — separate palette from the left input modules.
// Kept premium/subtle within the dark theme.
const RIGHT_WIRES = [
  { color: "#C4B5FD", glow: "rgba(196,181,253,0.55)" }, // violet — Camera
  { color: "#F5A623", glow: "rgba(245,166,35,0.55)"  }, // amber  — Screen Share
  { color: "#F472B6", glow: "rgba(244,114,182,0.55)" }, // rose   — Agent
  { color: "#7DD3FC", glow: "rgba(125,211,252,0.55)" }, // sky    — Workflow
];
const PLANET_R   = 700;  // physical radius of the globe (increased heavily for larger size)

// ─── Particle Orb ─────────────────────────────────────────────────────────────
function ParticleOrb({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const S = 1000; // Increased canvas size to prevent clipping

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const cx = c.getContext("2d"); if (!cx) return;
    const W = c.width, H = c.height;

    // Sphere points
    const N = 500, φ = Math.PI * (3 - Math.sqrt(5));
    const spherePts = Array.from({ length: N }, (_, i) => {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const t = φ * i;
      return { bx: Math.cos(t) * r, by: y, bz: Math.sin(t) * r, isRing: false };
    });

    // Ring points
    const numRingPts = 900;
    const ringPts = Array.from({ length: numRingPts }, (_, i) => {
      let r = 1.15 + Math.random() * 0.65; // 1.15 to 1.8
      // Cassini division
      if (r > 1.45 && r < 1.55) {
         if (Math.random() > 0.1) r += 0.1;
      }
      const t = Math.random() * Math.PI * 2;
      return { bx: Math.cos(t) * r, by: (Math.random() - 0.5) * 0.015, bz: Math.sin(t) * r, isRing: true, rad: r };
    });

    const pts = [...spherePts, ...ringPts];

    let ay = 0, id: number;

    function frame() {
      cx.clearRect(0, 0, W, H);
      ay += active ? 0.006 : 0.0015;
      const cY = Math.cos(ay), sY = Math.sin(ay);
      const cX = Math.cos(0.35), sX = Math.sin(0.35); // Fixed tilt for Saturn look

      if (active) {
        const hue = (ay * 150) % 360;
        const g = cx.createRadialGradient(W/2, H/2, 0, W/2, H/2, PLANET_R * 0.7);
        g.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.2)`);
        g.addColorStop(0.5, `hsla(${hue}, 100%, 65%, 0.08)`);
        g.addColorStop(1, "transparent");
        cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      } else {
        const g = cx.createRadialGradient(W/2, H/2, 0, W/2, H/2, PLANET_R * 0.7);
        g.addColorStop(0, "rgba(16,185,129,0.09)");
        g.addColorStop(0.5, "rgba(4,120,87,0.04)");
        g.addColorStop(1, "transparent");
        cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      }

      // Darker holographic Jupiter-core mass with restrained horizontal banding.
      cx.save();
      cx.translate(W / 2, H / 2);
      const body = cx.createRadialGradient(0, -18, 12, 0, 0, PLANET_R * 0.36);
      if (active) {
        body.addColorStop(0, "rgba(21, 94, 117, 0.28)");
        body.addColorStop(0.55, "rgba(6, 78, 91, 0.18)");
      } else {
        body.addColorStop(0, "rgba(6, 78, 59, 0.20)");
        body.addColorStop(0.58, "rgba(3, 45, 40, 0.16)");
      }
      body.addColorStop(1, "rgba(2, 8, 12, 0)");
      cx.beginPath();
      cx.ellipse(0, 0, PLANET_R * 0.34, PLANET_R * 0.245, 0, 0, Math.PI * 2);
      cx.fillStyle = body;
      cx.fill();

      cx.clip();
      [-84, -56, -28, 0, 28, 56, 84].forEach((y, idx) => {
        const edge = Math.abs(y) / 84;
        cx.beginPath();
        cx.ellipse(0, y, PLANET_R * (0.30 - edge * 0.035), 7 + edge * 4, 0, 0, Math.PI * 2);
        cx.strokeStyle = active
          ? `rgba(170, 255, 244, ${0.06 + (idx % 2) * 0.035})`
          : `rgba(167, 243, 208, ${0.075 + (idx % 2) * 0.04})`;
        cx.lineWidth = idx === 3 ? 2.1 : 1.25;
        cx.stroke();
      });
      cx.restore();
      // Outer glow circle removed as requested by user

      const sorted = pts.map(p => {
        const x1 = p.bx * cY + p.bz * sY;
        const z1 = -p.bx * sY + p.bz * cY;
        const y2 = p.by * cX - z1 * sX;
        const z2 = p.by * sX + z1 * cX;
        const fov = 2.85, pz = z2 + fov;
        return { px: (x1 / pz) * PLANET_R, py: (y2 / pz) * PLANET_R, d: (z2 + 1) / 2, by: p.by, isRing: p.isRing, rad: (p as any).rad };
      }).sort((a, b) => a.d - b.d);

      sorted.forEach(({ px, py, d, by, isRing, rad }) => {
        const sx = W/2 + px, sy = H/2 + py;
        const sz = Math.max(0.1, active ? 0.6 + d * 1.8 : 0.5 + d * 1.2);
        let op = active ? 0.2 + d * 0.8 : 0.18 + d * 0.35;
        op = Math.max(0.1, Math.min(1, op)); // Clamp opacity to prevent negative values on the back side
        
        let cr=47, cg=224, cb=200;
        
        if (!active) {
          // Theme Green for standby
          cr=52; cg=211; cb=153;
        }

        if (isRing) {
          if (active) {
            cr=180; cg=255; cb=245;
          } else {
            cr=110; cg=230; cb=180; // Softer green for ring in standby
          }
          op *= 0.9; // Made much more prominent (was 0.5)
          if (rad > 1.45 && rad < 1.55) op *= 0.3; // Cassini division
        } else {
          if (active) {
            const band = Math.sin(by * 15) + Math.cos(by * 35) * 0.5;
            if (band > 0.8) { cr=180; cg=255; cb=245; }
            else if (band > 0.2) { cr=30; cg=150; cb=180; }
            else if (band > -0.5) { cr=47; cg=224; cb=200; }
            else if (band > -1.2) { cr=20; cg=100; cb=140; }
          } else {
            // Standby bands in shades of green
            const band = Math.sin(by * 15) + Math.cos(by * 35) * 0.5;
            if (band > 0.8) { cr=74; cg=222; cb=170; } // restrained green highlight, not white sparkle
            else if (band > 0.2) { cr=52; cg=211; cb=153; } // #34D399
            else if (band > -0.5) { cr=16; cg=185; cb=129; } // #10B981
            else if (band > -1.2) { cr=4; cg=120; cb=87; } // #047857
          }
        }

        cx.beginPath();
        cx.arc(sx, sy, sz, 0, Math.PI * 2);
        cx.fillStyle = `rgba(${cr},${cg},${cb},${active ? op : op * 0.55})`;
        cx.fill();
        
        if (active && d > 0.82 && !isRing) {
          cx.beginPath();
          cx.arc(sx, sy, Math.max(0.1, sz * 0.5), 0, Math.PI * 2);
          cx.fillStyle = `rgba(180,255,245,${(d - 0.82) * 2.0})`;
          cx.fill();
        }
      });
      id = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(id);
  }, [active]);

  return <canvas ref={ref} width={S} height={S} style={{ display: "block", position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "100%" }} />;
}

// ─── Connector SVG ────────────────────────────────────────────────────────────
// Geometry constants MUST stay in sync with OperationsPanel layout.
function ConnectorSVG({ active, W, H, globeSize, globeCenterX }: { active: boolean; W: number; H: number; globeSize: number; globeCenterX: number }) {
  const nodeX = C_LEFT_STACK_X + C_CARD_W;                    // right edge of card column
  // Globe is now the true center hub of the Operations Status composition.
  const visualPlanetR = Math.round(globeSize * 0.43);
  const orbEdgeX = globeCenterX - visualPlanetR;
  const midX  = Math.round(nodeX + (orbEdgeX - nodeX) * 0.70);
  const midY  = Math.round(H * C_GLOBE_Y_RATIO);
  const nodeCardsTotalH = NODES.length * C_CARD_H + (NODES.length - 1) * C_CARD_GAP;
  const startY = midY - nodeCardsTotalH / 2;
  const ys    = NODES.map((_, i) => startY + i * (C_CARD_H + C_CARD_GAP) + Math.round(C_CARD_H / 2));

  return (
    <svg width="100%" height="100%"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "block", overflow: "visible" }}>
      <defs>
        {NODES.map((_, i) => (
          <filter key={i} id={`cf${i}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        ))}
        <filter id="cfmain" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="cjunc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2FE0C8" stopOpacity={active ? "0.9" : "0.4"} />
          <stop offset="100%" stopColor="#2FE0C8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {ys.map((y, i) => {
        const col = NODES[i].color;
        const pid = `nc${i}`;
        const c1x = Math.round(nodeX + (midX - nodeX) * 0.38);
        const c2x = Math.round(nodeX + (midX - nodeX) * 0.74);
        const d   = `M ${nodeX} ${y} C ${c1x} ${y}, ${c2x} ${midY}, ${midX} ${midY}`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={col} strokeWidth="2.5" opacity={active ? "0.2" : "0.06"} />
            <path id={pid} d={d} fill="none" stroke={col} strokeWidth={active ? "1.8" : "1.2"}
              opacity={active ? 0.85 : 0.25} filter={`url(#cf${i})`} />
            <circle cx={nodeX} cy={y} r={active ? "4.5" : "3.5"} fill="#0D0F14" stroke={col} strokeWidth="1.5" opacity="0.88" />
            <circle cx={nodeX} cy={y} r={active ? "2.5" : "1.6"} fill={col} opacity={active ? "1" : "0.55"}>
              <animate attributeName="opacity" values={active ? "0.8;1;0.8" : "0.3;0.6;0.3"} dur="1s" repeatCount="indefinite" />
            </circle>
            <circle r={active ? "3" : "2"} fill={col} opacity={active ? "1" : "0.5"}>
              <animateMotion dur={`${2.5 + i * 0.45}s`} repeatCount="indefinite" begin={`${i * 0.55}s`}>
                <mpath href={`#nc${i}`} />
              </animateMotion>
            </circle>
          </g>
        );
      })}

      {/* Junction */}
      <circle cx={midX} cy={midY} r="10" fill="url(#cjunc)" opacity={active ? "0.55" : "0.2"} />
      <circle cx={midX} cy={midY} r="5.5" fill="#0D0F14" stroke="#22252D" strokeWidth="1.5" />
      <circle cx={midX} cy={midY} r="2.5" fill="#2FE0C8" opacity={active ? "0.95" : "0.5"}>
        <animate attributeName="r" values={active ? "2;3.5;2" : "1.8;2.8;1.8"} dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Junction → orb */}
      {(() => {
        const d2 = `M ${midX} ${midY} C ${midX + Math.round((orbEdgeX-midX)*0.38)} ${midY}, ${orbEdgeX - Math.round((orbEdgeX-midX)*0.18)} ${midY}, ${orbEdgeX} ${midY}`;
        return (
          <g>
            <path d={d2} fill="none" stroke="#2FE0C8" strokeWidth="2.5" opacity="0.06" />
            <path id="ncmain" d={d2} fill="none" stroke="#2FE0C8" strokeWidth="1.5"
              opacity={active ? 0.65 : 0.28} filter="url(#cfmain)" />
            <circle r="2.5" fill="#2FE0C8" opacity={active ? "1" : "0.6"}>
              <animateMotion dur="1.6s" repeatCount="indefinite">
                <mpath href="#ncmain" />
              </animateMotion>
            </circle>
          </g>
        );
      })()}

      {/* Orb entry dot */}
      <circle cx={orbEdgeX} cy={midY} r="3.5" fill="#0D0F14" stroke="#2FE0C8" strokeWidth="1.5" opacity="0.85" />
      <circle cx={orbEdgeX} cy={midY} r="1.6" fill="#2FE0C8" opacity={active ? "0.9" : "0.5"} />
    </svg>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────
const Mono = ({
  children, className = "", style,
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <span
    className={`font-mono text-[10px] uppercase tracking-[0.08em] text-[#5C616B] ${className}`}
    style={style}>
    {children}
  </span>
);

function StatusDot({ s }: { s: "active" | "standby" | "error" }) {
  const cols = { active: "#34D399", standby: "#5C616B", error: "#FF5C5C" };
  return (
    <span className="dot-pulse flex-shrink-0 rounded-full"
      style={{ width: 6, height: 6, background: cols[s], display: "inline-block" }} />
  );
}

// ─── Left Sidebar ─────────────────────────────────────────────────────────────
function UpdaterWidget() {
  const [updateStatus, setUpdateStatus] = useState<string>("Check for Updates");
  const [progress, setProgress] = useState<number | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    if (!(window as any).electronAPI) return;
    const api = (window as any).electronAPI;

    api.onUpdateAvailable((info: any) => setUpdateStatus("Update Available!"));
    
    api.onUpdateNotAvailable(() => {
      setUpdateStatus("Up to date");
      setTimeout(() => setUpdateStatus("Check for Updates"), 3000);
    });

    api.onUpdateProgress((prog: any) => {
      setUpdateStatus("Downloading...");
      setProgress(Math.round(prog.percent));
    });

    api.onUpdateDownloaded(() => {
      setUpdateStatus("Restart to Install");
      setProgress(null);
      setIsDownloaded(true);
    });

    api.onUpdateError((err: string) => {
      setUpdateStatus("Update Failed");
      setProgress(null);
      setTimeout(() => setUpdateStatus("Check for Updates"), 3000);
    });
  }, []);

  const handleAction = () => {
    const api = (window as any).electronAPI;
    if (isDownloaded) {
      api?.installUpdate();
    } else {
      setUpdateStatus("Checking...");
      api?.checkForUpdates();
    }
  };

  return (
    <button className="glass-btn" onClick={handleAction} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "7px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 6, background: isDownloaded ? "rgba(52,211,153,0.15)" : undefined, border: isDownloaded ? "1px solid rgba(52,211,153,0.3)" : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <RefreshCw size={13} style={{ color: isDownloaded ? "#34D399" : "#4A5066" }} className={progress !== null ? "spin" : ""} />
        <span style={{ fontSize: 11.5, color: isDownloaded ? "#34D399" : "#7A8090", fontWeight: isDownloaded ? 600 : 400 }}>{updateStatus}</span>
      </div>
      {progress !== null && <span style={{ fontSize: 10, color: "#34D399" }}>{progress}%</span>}
    </button>
  );
}

function LeftSidebar({  activeNav, setActiveNav, onOpenSettings }: { activeNav: string; setActiveNav: (id: string) => void; onOpenSettings: () => void; }) {
  const [showModules, setShowModules] = useState(false);
  return (
    <div style={{
      width: 220, flexShrink: 0,
      display: "flex", flexDirection: "column",
      background: "#090B11",
      borderRight: "1px solid #1A1D24",
      minHeight: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "10px 14px 6px", flexShrink: 0 }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.15)" }} />
        </div>
      </div>

      {/* Scrollable nav area */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 4 }} className="custom-scroll">
        {/* Core Apps */}
        <div style={{ padding: "3px 14px 5px" }}>
          <Mono>Core Apps</Mono>
        </div>
        {NAV_ITEMS.map(item => {
          const isActive = activeNav === item.id;
          return (
            <button key={item.id} 
              onClick={() => { playUISound('tab-click'); setActiveNav(item.id); }}
              onMouseEnter={() => playUISound('hover')}
              className={`group ${isActive ? "glass-btn-active" : "glass-btn"}`}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "7px 14px", textAlign: "left", borderRadius: 8, marginBottom: 4,
                borderLeft: `2px solid ${isActive ? item.color : "transparent"}`,
                transition: "all 0.3s ease"
              }}>
              <div className="transition-transform duration-300 ease-out group-hover:scale-125 group-hover:-rotate-6"
                   style={{ transform: isActive ? "scale(1.15)" : "scale(1)" }}>
                <item.Icon size={13} style={{ 
                  color: item.color, 
                  opacity: isActive ? 1 : 0.65, 
                  filter: isActive ? `drop-shadow(0 0 6px ${item.color}80)` : "none",
                  flexShrink: 0,
                  transition: "all 0.3s ease"
                }} />
              </div>
              <span className="transition-colors duration-300" style={{ fontSize: 11.5, color: isActive ? "#F5F6F8" : "#7A8090", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Business Modules - Collapsible */}
        <div style={{ padding: "10px 14px 5px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Mono>Business Modules</Mono>
          <button onClick={() => { playUISound('soft-click'); setShowModules(!showModules); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: 4, cursor: "pointer", transition: "all 0.2s" }}>
            <ChevronDown size={11} style={{ color: "#5C616B", transform: showModules ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
          </button>
        </div>
        {showModules && MODULES.map((mod, i) => (
          <button key={i} className="group glass-btn"
            onClick={() => playUISound('click')}
            onMouseEnter={() => playUISound('hover')}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "5px 14px", borderRadius: 8, marginBottom: 4,
              transition: "all 0.3s ease"
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className="transition-transform duration-300 ease-out group-hover:scale-125 group-hover:-rotate-6">
                <mod.Icon size={11} style={{ color: mod.color, opacity: 0.75, flexShrink: 0, transition: "all 0.3s ease" }} />
              </div>
              <span className="transition-colors duration-300 group-hover:text-white" style={{ fontSize: 11, color: "#6B7280" }}>{mod.label}</span>
            </div>
            <span className="soon-badge">SOON</span>
          </button>
        ))}
      </div>

      {/* Pinned Settings - Always visible at bottom */}
      <div style={{ flexShrink: 0, padding: "6px 14px 0px", display: "flex", flexDirection: "column", gap: 4 }}>
        <UpdaterWidget />
      </div>
      <div style={{ flexShrink: 0, padding: "6px 14px 10px", borderTop: "1px solid #1A1D24" }}>
        <button className="glass-btn" 
          onClick={() => { playUISound('click'); onOpenSettings(); }}
          onMouseEnter={() => playUISound('hover')}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "7px 14px", borderRadius: 8, cursor: "pointer"
          }}>
          <Settings size={13} style={{ color: "#4A5066" }} />
          <span style={{ fontSize: 11.5, color: "#7A8090" }}>Settings</span>
        </button>
      </div>
    </div>
  );
}

// ─── Operations Panel ─────────────────────────────────────────────────────────
function OperationsPanel({ aiActive, onToggleAI, onOpenModal }: { aiActive: boolean; onToggleAI: () => void; onOpenModal: (type: 'memory'|'soul'|'skills'|'settings') => void; }) {
  const [activeNode, setActiveNode] = useState<string | null>("soul");
  const [agentTab, setAgentTab] = useState("town");
  const [cameraOn, setCameraOn] = useState(false);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  const toggleCamera = useCallback(async () => {
    playUISound('click');
    if (cameraOn) {
      cameraStreamRef.current?.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
      setCameraOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      cameraStreamRef.current = stream;
      setCameraOn(true);
    } catch (err) {
      console.error('Camera access denied', err);
      alert('Camera access denied or unavailable.');
    }
  }, [cameraOn]);

  const toggleScreenShare = useCallback(async () => {
    playUISound('click');
    if (screenShareOn) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      setScreenShareOn(false);
      return;
    }
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = stream;
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        screenStreamRef.current = null;
        setScreenShareOn(false);
      });
      setScreenShareOn(true);
    } catch (err) {
      console.error('Screen share denied', err);
    }
  }, [screenShareOn]);

  useEffect(() => {
    if (cameraVideoRef.current && cameraStreamRef.current) {
      cameraVideoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [cameraOn]);
  useEffect(() => {
    if (screenVideoRef.current && screenStreamRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
  }, [screenShareOn]);
  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const panelRef = useRef<HTMLDivElement>(null);
  const [dims,  setDims]  = useState({ w: 600, h: 640 });

  useEffect(() => {
    const el = panelRef.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setDims({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
    ro.observe(el);
    setDims({ w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) });
    return () => ro.disconnect();
  }, []);

  // Computed height of the node-map section
  const baseNodeMapH = NODES.length * C_CARD_H + (NODES.length - 1) * C_CARD_GAP + C_PAD * 2;
  const availableCompositionH = Math.max(baseNodeMapH + 220, dims.h - 36 - 32);
  const nodeMapH = Math.max(baseNodeMapH + 220, Math.round(availableCompositionH * 0.80));
  const globeSize = Math.min(390, Math.max(330, Math.round(Math.min(dims.w * 0.47, nodeMapH * 0.58))));
  const globeCenterY = Math.round(nodeMapH * C_GLOBE_Y_RATIO);
  const nodeCardsTotalH = NODES.length * C_CARD_H + (NODES.length - 1) * C_CARD_GAP;
  const nodeCardsTop = Math.round(globeCenterY - nodeCardsTotalH / 2);
  const rightActionStackX = Math.max(C_LEFT_STACK_X + C_CARD_W + 260, dims.w - C_LEFT_STACK_X - 33);
  const globeCenterX = Math.round((C_LEFT_STACK_X + C_CARD_W + rightActionStackX) / 2);
  const agentTownMinH = Math.max(118, Math.round(availableCompositionH * 0.18));

  return (
    <div ref={panelRef} style={{
      flex: 1, minWidth: 0,
      display: "flex", flexDirection: "column",
      borderRight: "1px solid #1A1D24",
      overflow: "hidden",
    }}>

      {/* ── Operations header ── */}
      <div style={{
        height: 36, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 14px",
        borderBottom: "1px solid #1A1D24",
        background: "rgba(10,12,18,0.5)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StatusDot s="active" />
          <Mono className="!text-[#9AA0AC] !text-[10.5px]">Operations Status</Mono>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL", "HIGH", "MED"].map((f, i) => (
            <button key={f} 
              onClick={() => playUISound('soft-click')}
              onMouseEnter={() => playUISound('hover')}
              className={i === 0 ? "glass-btn-active" : "glass-btn"} style={{
              fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace",
              padding: "4px 8px", borderRadius: 6, textTransform: "uppercase" as const,
              color: i === 0 ? "#F5F6F8" : "#5C616B",
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* ── Node map ── */}
      <div style={{
        position: "relative", flexShrink: 0, height: nodeMapH,
        display: "flex", alignItems: "stretch",
        padding: C_PAD, gap: 0,
        marginBottom: 0,
        marginTop: 0,
      }}>
        <ConnectorSVG active={aiActive} W={dims.w} H={nodeMapH} globeSize={globeSize} globeCenterX={globeCenterX} />

        {/* Node cards column */}
        <div style={{
          display: "flex", flexDirection: "column", gap: C_CARD_GAP,
          position: "relative", zIndex: 10,
          width: C_CARD_W, flexShrink: 0,
          marginLeft: C_LEFT_STACK_X - C_PAD,
          marginTop: nodeCardsTop,
        }}>
          {NODES.map(n => {
            const lit = activeNode === n.id;
            return (
              <button key={n.id} onClick={() => {
                playUISound('click');
                setActiveNode(n.id);
                onOpenModal(n.id);
              }}
                onMouseEnter={() => playUISound('hover')}
                className={lit ? "glass-btn-active" : "glass-btn"}
                style={{
                  height: C_CARD_H, width: C_CARD_W,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 10,
                  transform:  lit ? "translateY(-1px)" : "none",
                  background: lit ? n.bg : "transparent",
                  border: lit ? `1px solid ${n.color}40` : "1px solid transparent",
                  boxShadow: lit ? `0 0 14px ${n.glow}` : "none",
                }}
                title={n.label}>
                <n.Icon size={16} style={{ color: lit ? n.color : "#8A909E" }} />
              </button>
            );
          })}
        </div>

        {/* True-center globe composition + aligned right controls */}
        <div style={{
          position: "absolute", inset: C_PAD,
          zIndex: 10,
          pointerEvents: "none",
        }}>
          {/* Right control rail — vertically centered to the globe hub */}
          <div style={{
            position: "absolute", top: globeCenterY - C_PAD - 8, left: rightActionStackX - C_PAD,
            transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", gap: 10, zIndex: 30,
            pointerEvents: "auto",
          }}>
            <button
              onClick={toggleCamera}
              onMouseEnter={() => playUISound('hover')}
              title={cameraOn ? "Turn off camera" : "Turn on laptop camera"}
              className="glass-btn"
              style={{ padding: 8, borderRadius: 8, cursor: "pointer", color: cameraOn ? "#2FE0C8" : "#5C616B", background: cameraOn ? "rgba(47, 224, 200, 0.15)" : "transparent", border: cameraOn ? "1px solid rgba(47, 224, 200, 0.3)" : "1px solid transparent" }}
              onMouseOver={(e) => { if (!cameraOn) { e.currentTarget.style.color = "#2FE0C8"; e.currentTarget.style.background = "rgba(47, 224, 200, 0.05)"; e.currentTarget.style.border = "1px solid rgba(47, 224, 200, 0.1)"; } }}
              onMouseOut={(e) => { if (!cameraOn) { e.currentTarget.style.color = "#5C616B"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; } }}
            >
              <Camera size={15} />
            </button>
            <button
              onClick={toggleScreenShare}
              onMouseEnter={() => playUISound('hover')}
              title={screenShareOn ? "Stop screen share" : "Share your screen"}
              className="glass-btn"
              style={{ padding: 8, borderRadius: 8, cursor: "pointer", color: screenShareOn ? "#2FE0C8" : "#5C616B", background: screenShareOn ? "rgba(47, 224, 200, 0.15)" : "transparent", border: screenShareOn ? "1px solid rgba(47, 224, 200, 0.3)" : "1px solid transparent" }}
              onMouseOver={(e) => { if (!screenShareOn) { e.currentTarget.style.color = "#2FE0C8"; e.currentTarget.style.background = "rgba(47, 224, 200, 0.05)"; e.currentTarget.style.border = "1px solid rgba(47, 224, 200, 0.1)"; } }}
              onMouseOut={(e) => { if (!screenShareOn) { e.currentTarget.style.color = "#5C616B"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; } }}
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => { playUISound('click'); onOpenModal('skills'); }}
              onMouseEnter={() => playUISound('hover')}
              title="Agent"
              className="glass-btn"
              style={{ padding: 8, borderRadius: 8, cursor: "pointer", color: "#5C616B", background: "transparent", border: "1px solid transparent" }}
              onMouseOver={(e) => { e.currentTarget.style.color = "#2FE0C8"; e.currentTarget.style.background = "rgba(47, 224, 200, 0.05)"; e.currentTarget.style.border = "1px solid rgba(47, 224, 200, 0.1)"; }}
              onMouseOut={(e) => { e.currentTarget.style.color = "#5C616B"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; }}
            >
              <Bot size={15} />
            </button>
            <button
              onClick={() => { playUISound('click'); }}
              onMouseEnter={() => playUISound('hover')}
              title="Workflow"
              className="glass-btn"
              style={{ padding: 8, borderRadius: 8, cursor: "pointer", color: "#5C616B", background: "transparent", border: "1px solid transparent" }}
              onMouseOver={(e) => { e.currentTarget.style.color = "#2FE0C8"; e.currentTarget.style.background = "rgba(47, 224, 200, 0.05)"; e.currentTarget.style.border = "1px solid rgba(47, 224, 200, 0.1)"; }}
              onMouseOut={(e) => { e.currentTarget.style.color = "#5C616B"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; }}
            >
              <Workflow size={15} />
            </button>
          </div>

          {/* Live media previews (top-left) */}
          {(cameraOn || screenShareOn) && (
            <div style={{ position: "absolute", top: globeCenterY - C_PAD - Math.round(globeSize / 2) - 18, left: globeCenterX - C_PAD - Math.round(globeSize / 2) - 22, display: "flex", flexDirection: "column", gap: 6, zIndex: 30, pointerEvents: "auto" }}>
              {cameraOn && (
                <video ref={cameraVideoRef} autoPlay playsInline muted
                  style={{ width: 90, height: 68, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(47,224,200,0.4)", background: "#000", transform: "scaleX(-1)" }} />
              )}
              {screenShareOn && (
                <video ref={screenVideoRef} autoPlay playsInline muted
                  style={{ width: 90, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(47,224,200,0.4)", background: "#000" }} />
              )}
            </div>
          )}

          <style>{`
            @keyframes shake-orb {
              0% { transform: translate(0, 0) scale(1); }
              25% { transform: translate(-1px, 1px) scale(1.02); }
              50% { transform: translate(1px, -1px) scale(1); }
              75% { transform: translate(1px, 1px) scale(1.01); }
              100% { transform: translate(0, 0) scale(1); }
            }
            .orb-shake { animation: shake-orb 0.4s ease-in-out infinite; }
          `}</style>

          {/* Center stack: globe + Start AI button, fixed on the composition center axis */}
          <div style={{
            position: "absolute", left: globeCenterX - C_PAD, top: globeCenterY - C_PAD - globeSize / 2,
            transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 13,
            pointerEvents: "auto",
          }}>
            <div style={{ position: "relative", width: globeSize, height: globeSize }}>
              <div className={aiActive ? "orb-breathe" : ""}
                style={{
                  position: "absolute", width: "100%", height: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  filter: aiActive
                    ? "drop-shadow(0 0 40px rgba(47,224,200,0.55))"
                    : "drop-shadow(0 0 16px rgba(47,224,200,0.18)) drop-shadow(0 0 6px rgba(210,225,240,0.10))",
                  pointerEvents: "none",
                  transition: "filter 0.5s ease",
                  opacity: aiActive ? 1 : 0.82,
                }}>
                <ParticleOrb active={aiActive} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, width: 200 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
              <Mono style={{ fontSize: 9, color: "#5C616B", letterSpacing: "0.2em" }}>· SYSTEM STANDBY ·</Mono>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
            </div>
            <button
              onClick={async () => {
                playUISound('powerup');
                onToggleAI();
                if ((window as any).electronAPI) {
                  if (!aiActive) {
                    await (window as any).electronAPI.startGeminiVoiceAssistant?.();
                    await (window as any).electronAPI.triggerGeminiLiveCall?.(true);
                  } else {
                    await (window as any).electronAPI.triggerGeminiLiveCall?.(false);
                    await (window as any).electronAPI.stopGeminiVoiceAssistant?.();
                  }
                }
              }}
              onMouseEnter={() => playUISound('hover')}
              className={aiActive ? "glass-btn" : "glass-btn-active"}
              style={{
                padding: "8px 38px", borderRadius: 24,
                fontSize: 13, fontWeight: 600,
                color: aiActive ? "#FF5C5C" : "#34D399",
                cursor: "pointer",
                background: "rgba(10, 15, 20, 0.8)",
                border: "1px solid rgba(52, 211, 153, 0.2)"
              }}
              onMouseOver={(e) => { if(!aiActive) e.currentTarget.style.boxShadow = "0 0 15px rgba(52, 211, 153, 0.2)"; }}
              onMouseOut={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              {aiActive ? "STOP AI" : "START AI"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Agent Town tab bar ── */}
      <div style={{
        height: 34, flexShrink: 0, marginTop: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 14px",
        borderTop: "1px solid #1A1D24",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StatusDot s="error" />
          <Mono className="!text-[#9AA0AC]">Agent Town</Mono>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {[{ id: "town", l: "Agent Town" }, { id: "visual", l: "Visual Hub" }].map(tab => (
            <button key={tab.id} 
              onClick={() => { playUISound('tab-click'); setAgentTab(tab.id); }}
              onMouseEnter={() => playUISound('hover')}
              className={agentTab === tab.id ? "glass-btn-active" : "glass-btn"}
              style={{
                fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace",
                padding: "4px 8px", borderRadius: 5, textTransform: "uppercase" as const,
                color: agentTab === tab.id ? "#F5F6F8"  : "#5C616B",
              }}>{tab.l}</button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: agentTownMinH }} className="custom-scroll">
      </div>

      {/* ── Status bar ── */}
      <div style={{
        height: 32, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 14px",
        borderTop: "1px solid #1A1D24",
        background: "rgba(10,12,18,0.4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StatusDot s="active" />
          <Mono>All Systems Normal</Mono>
        </div>
        <input placeholder="Add new objective..."
          style={{ fontSize: 11, background: "transparent", outline: "none", color: "#5C616B", width: 155 }} />
      </div>
    </div>
  );
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ m }: { m: any }) {
  const isUser   = m.role === "user";
  const hasArabic = /[\u0600-\u06FF]/.test(m.text || '');
  const parts    = (m.text || '').split(/(\*\*[^*]+\*\*)/g);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(m.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", padding: "0 12px" }}>
      {!isUser && (
        <div style={{
          width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
          marginRight: 7, marginTop: 3,
          background: "rgba(47,224,200,0.1)", border: "1px solid rgba(47,224,200,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Layers size={10} style={{ color: "#2FE0C8" }} />
        </div>
      )}
      <div style={{
        maxWidth: "88%", borderRadius: 12, padding: "8px 11px",
        fontSize: 12, lineHeight: 1.7, color: "#E8EAF0",
        background: isUser ? "rgba(47,224,200,0.07)" : "#15181E",
        border: `1px solid ${isUser ? "rgba(47,224,200,0.18)" : "#1D2028"}`,
        borderBottomRightRadius: isUser ? 3 : 12,
        borderBottomLeftRadius:  isUser ? 12 : 3,
        direction:  hasArabic ? "rtl"   : "ltr",
        textAlign:  hasArabic ? "right" : "left",
      }}>
        {m.reasoning && (
          <div style={{ fontSize: 10, color: "#9AA0AC", marginBottom: 4, fontStyle: "italic", borderBottom: "1px solid #1A1D24", paddingBottom: 4 }}>
            {m.reasoning}
          </div>
        )}
        {m.status && (
          <div style={{ fontSize: 10, color: "#2FE0C8", marginBottom: 4 }}>
            <span className="animate-pulse">▶</span> {m.status}
          </div>
        )}
        {parts.map((part: string, i: number) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} style={{ color: "#F5F6F8" }}>{part.slice(2, -2)}</strong>;
          }
          return (
            <span key={i}>
              {part.split("\n").map((line, j, arr) => (
                <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
              ))}
            </span>
          );
        })}
        {m.isStreaming && <span className="animate-pulse ml-1 text-[#2FE0C8]">▋</span>}
      </div>
      {!isUser && !m.isStreaming && (
        <button 
          onClick={handleCopy}
          className="glass-btn"
          style={{ 
            marginLeft: 8, marginTop: 4, width: 24, height: 24, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0.6, flexShrink: 0, alignSelf: "flex-end"
          }}
          title="Copy"
        >
          {copied ? <Check size={12} color="#34D399" /> : <Copy size={12} color="#9AA0AC" />}
        </button>
      )}
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
import { useElectronChat } from "@/hooks/digi/useElectronChat";
import { useSpeechRecognition } from "@/hooks/digi/useSpeechRecognition";

function ChatPanel({ aiActive, onToggleAI, isOpen, onToggle }: { aiActive: boolean; onToggleAI: () => void; isOpen: boolean; onToggle: () => void }) {
  const [input,     setInput] = useState("");
  const { msgs, send, connected, listening } = useElectronChat(aiActive);
  const endRef = useRef<HTMLDivElement>(null);

  const { isListening, startListening, stopListening } = useSpeechRecognition((text, isFinal) => {
    if (isFinal) {
      send(text);
      setInput("");
    } else {
      setInput(text);
    }
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    if (aiActive) {
      startListening();
    } else {
      stopListening();
    }
  }, [aiActive, startListening, stopListening]);

  useEffect(() => {
    const api = (window as any).electronAPI;
    if (!api) return;

    if (aiActive) {
      api.startGeminiVoiceAssistant?.().catch((err: any) => {
        console.error('Failed to start hidden Gemini voice session:', err);
      });
    } else {
      api.stopGeminiVoiceAssistant?.().catch((err: any) => {
        console.error('Failed to stop hidden Gemini voice session:', err);
      });
    }
  }, [aiActive]);

  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.onWakeWord) {
      (window as any).electronAPI.onWakeWord((command: string) => {
        if (!aiActive) onToggleAI();
        if (!isOpen) onToggle();
        send(command);
      });
    }
  }, [aiActive, isOpen, onToggleAI, onToggle, send]);

  const handleSend = () => {
    if (!input.trim()) return;
    playUISound('send');
    send(input);
    setInput("");
  };

  return (
    <div style={{
      width: 270, flexShrink: 0,
      display: "flex", flexDirection: "column",
      borderRight: "1px solid #1A1D24",
      background: "rgba(9,10,15,0.75)",
    }}>
      {/* Top Header */}
      <div style={{
        padding: "12px 14px 6px",
        display: "flex", alignItems: "center", justifyContent: "flex-end",
      }}>
        <button className="glass-btn" 
          onClick={() => playUISound('soft-click')}
          onMouseEnter={() => playUISound('hover')}
          style={{ padding: "6px", borderRadius: 8 }}>
          <RotateCcw size={13} style={{ color: "#9AA0AC" }} />
        </button>
      </div>

      {/* Search bar */}
      <div style={{
        height: 36, flexShrink: 0,
        display: "flex", alignItems: "center", gap: 8,
        padding: "0 12px",
        borderBottom: "1px solid #1A1D24",
        background: "rgba(10,12,18,0.5)",
      }}>
        <Search size={13} style={{ color: "#5C616B", flexShrink: 0 }} />
        <input placeholder="Search anything..."
          style={{ flex: 1, background: "transparent", outline: "none", fontSize: 12, color: "#F5F6F8" }} />
        <Monitor size={13} style={{ color: "#5C616B" }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 0", display: "flex", flexDirection: "column", gap: 10 }}
        className="no-scrollbar">

        {msgs.map(m => <ChatBubble key={m.id} m={m} />)}

        <div ref={endRef} />
      </div>

      {/* Chat Input like Gemini */}
      <div style={{ padding: 12 }}>
        <div style={{
          background: "#08090C", border: "1px solid #1E2129",
          borderRadius: 16, padding: "8px 10px",
          display: "flex", flexDirection: "column", gap: 6
        }}>
          <textarea
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Message Agent Town..."
            rows={1}
            style={{
              width: "100%", background: "transparent", border: "none", outline: "none", resize: "none",
              fontSize: 13, color: "#F5F6F8", lineHeight: 1.5, maxHeight: 68, padding: "2px 4px",
              overflow: "hidden", scrollbarWidth: "none"
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Attachment Buttons */}
            <div style={{ display: "flex", gap: 4 }}>
              <label className="glass-btn" 
                onClick={() => playUISound('soft-click')}
                onMouseEnter={() => playUISound('hover')}
                style={{
                width: 28, height: 28, borderRadius: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }} title="Add File">
                <input type="file" style={{ display: "none" }} />
                <Paperclip size={14} style={{ color: "#9AA0AC" }} />
              </label>
              <label className="glass-btn" 
                onClick={() => playUISound('soft-click')}
                onMouseEnter={() => playUISound('hover')}
                style={{
                width: 28, height: 28, borderRadius: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }} title="Upload Image">
                <input type="file" accept="image/*" style={{ display: "none" }} />
                <ImageIcon size={14} style={{ color: "#9AA0AC" }} />
              </label>
              <label className="glass-btn" 
                onClick={() => playUISound('soft-click')}
                onMouseEnter={() => playUISound('hover')}
                style={{
                width: 28, height: 28, borderRadius: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }} title="Integrate Folder">
                <input type="file" {...{ webkitdirectory: "", directory: "" } as any} style={{ display: "none" }} />
                <Folder size={14} style={{ color: "#9AA0AC" }} />
              </label>
            </div>

            {/* Mic + Send */}
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => { playUISound('tech'); isListening ? stopListening() : startListening(); }} 
                onMouseEnter={() => playUISound('hover')}
                style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isListening ? "rgba(47,224,200,0.1)" : "transparent",
                border: `1px solid ${isListening ? "#2FE0C8" : "#252830"}`,
              }}>
                <Mic size={11} style={{ color: isListening ? "#2FE0C8" : "#5C616B" }} />
              </button>
              <button onClick={handleSend} 
                onMouseEnter={() => playUISound('hover')}
                style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: input.trim() ? "#2FE0C8" : "transparent", 
                border: `1px solid ${input.trim() ? "transparent" : "#252830"}`,
                boxShadow: input.trim() ? "0 0 12px rgba(47,224,200,0.4)" : "none",
                transition: "all 0.2s ease"
              }}>
                <ArrowUp size={11} style={{ color: input.trim() ? "#08090C" : "#5C616B" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Title Bar ────────────────────────────────────────────────────────────────

// ─── Title Bar ────────────────────────────────────────────────────────────────
function TitleBar() {
  const handleWindowAction = (action: 'minimize' | 'maximize' | 'close') => {
    // Check if electronAPI exists (meaning we are running inside Electron)
    if (window.electronAPI && window.electronAPI[action]) {
      window.electronAPI[action]();
    } else {
      console.log(`Window action triggered: ${action} (Electron not detected)`);
    }
  };

  return (
    <div style={{
      height: 34, flexShrink: 0,
      display: "flex", alignItems: "center",
      background: "#07080C",
      borderBottom: "1px solid #1A1D24",
      position: "relative",
      WebkitAppRegion: "drag", // Enable dragging for Electron window
    } as React.CSSProperties}>
      {/* Left balance spacer (width = left sidebar) */}
      <div style={{ width: 220, flexShrink: 0 }} />

      {/* Centered title */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <span style={{
          fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
          color: "#D2D6E0",
        }}>DIGI BUSINESS OS</span>
      </div>

      {/* Window controls */}
      <div style={{ 
        width: 320, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8, gap: 6,
        WebkitAppRegion: "no-drag" // Buttons must not be draggable
      } as React.CSSProperties}>

        {([
          { act: 'minimize', icon: <span key="m" style={{ display: "block", width: 10, height: 1, background: "currentColor", borderRadius: 1 }} /> },
          { act: 'maximize', icon: <span key="s" style={{ display: "block", width: 10, height: 10, borderRadius: 2, border: "1px solid currentColor" }} /> },
          { act: 'close', icon: <svg key="x" width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ display: "block" }}>
            <line x1="1" y1="1" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="1" x2="1" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg> },
        ]).map((btn, i) => (
          <button key={i} 
          onClick={() => { playUISound('soft-click'); handleWindowAction(btn.act as 'minimize' | 'maximize' | 'close'); }}
          style={{
            width: 26, height: 22, borderRadius: 5, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#5C616B", transition: "color 150ms, background 150ms",
            cursor: "pointer"
          }}
          onMouseEnter={e => { playUISound('hover'); e.currentTarget.style.color = btn.act === 'close' ? "#FF5C5C" : "#9AA0AC"; e.currentTarget.style.background = btn.act === 'close' ? "rgba(255,92,92,0.1)" : "#1E212A"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#5C616B"; e.currentTarget.style.background = "transparent"; }}>
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Sound System ─────────────────────────────────────────────────────────────
const playUISound = (type: 'hover' | 'click' | 'tech' | 'powerup' | 'soft-click' | 'tab-click' | 'send') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    
    if (type === 'hover') {
      // Subtle sci-fi holographic chirp
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
      
    } else if (type === 'click') {
      // Sharp digital confirm click
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 5;
      
      osc.connect(filter);
      filter.connect(gain);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
      
    } else if (type === 'tech') {
      // Processing multi-beep
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1600, ctx.currentTime + 0.05);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
      osc.connect(gain);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.01);
      gain.gain.setValueAtTime(0.03, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.03, ctx.currentTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
      
    } else if (type === 'soft-click') {
      // Gentle, low-pitched click for minor interactions
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);

    } else if (type === 'tab-click') {
      // Crisp snap for changing tabs
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);

    } else if (type === 'send') {
      // Fast upward swoosh for sending messages
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);

    } else if (type === 'powerup') {
      const audio = new Audio('/audio/gadget-activation.mp3');
      audio.volume = 1.0;
      audio.play().catch(() => {});
    }
  } catch (e) {
    // Ignore audio context errors
  }
};

// ─── Startup Screen ────────────────────────────────────────────────────────────
function StartupScreen({ onComplete }: { onComplete: () => void }) {
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startVideo = () => {
    setStarted(true);
    playUISound('tech');
    if (videoRef.current) {
      videoRef.current.play().catch(e => {
        console.warn("Video play error, skipping:", e);
        onComplete();
      });
    } else {
      onComplete();
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
    }} onClick={!started ? startVideo : undefined}>
      
      {!started && (
        <div style={{
          position: "absolute", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 20
        }}>
          <img src={logoUrl} alt="DIGI" style={{ width: 80, height: 80, borderRadius: "50%", opacity: 0.8 }} className="blob-float" />
          <h2 style={{ color: "#2FE0C8", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", fontSize: 14 }} className="animate-pulse">
            CLICK ANYWHERE TO INITIALIZE
          </h2>
        </div>
      )}

      <video
        ref={videoRef}
        src={startupVideoUrl}
        onEnded={onComplete}
        onError={(e) => {
          console.warn("Video failed to load or play, skipping to next screen", e);
          onComplete(); // fallback so it doesn't get stuck
        }}
        style={{ 
          width: "100%", height: "100%", objectFit: "cover",
          opacity: started ? 1 : 0, transition: "opacity 0.5s ease"
        }}
      />
    </div>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("INITIALIZING_CORE_SYSTEMS...");

  useEffect(() => {
    const messages = [
      "ESTABLISHING_SECURE_CONNECTION...",
      "LOADING_MEMORY_SHARDS...",
      "OPTIMIZING_NEURAL_PATHWAYS...",
      "SYNCING_WITH_HERMES_BRIDGE...",
      "READY."
    ];
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 5) + 1; // Random increment 1-5
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(onComplete, 500); // Wait a bit at 100% before transitioning
      }
      setProgress(currentProgress);
      
      // Update text based on progress
      if (currentProgress > 85) setLoadingText(messages[4]);
      else if (currentProgress > 60) setLoadingText(messages[3]);
      else if (currentProgress > 40) setLoadingText(messages[2]);
      else if (currentProgress > 20) setLoadingText(messages[1]);
      else setLoadingText(messages[0]);
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998, background: "#050608",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif", color: "#F5F6F8"
    }}>
      {/* Logo container with spinning ring */}
      <div style={{ position: "relative", width: 120, height: 120, marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Spinning outer ring */}
        <div className="blob-float" style={{
          position: "absolute", inset: -10, borderRadius: "50%",
          border: "1px solid rgba(47, 224, 200, 0.15)",
          borderTopColor: "#2FE0C8",
          animation: "spin 3s linear infinite"
        }} />
        {/* Inner static ring */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }} />
        {/* Logo */}
        <img src={logoUrl} alt="DIGI Logo" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", zIndex: 2 }} />
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 32, letterSpacing: "0.5em", fontWeight: 300, 
        marginLeft: "0.5em", // offset for letter spacing centering
        marginBottom: 40, color: "#fff"
      }}>
        DIGI
      </h1>

      {/* Progress Bar Container */}
      <div style={{ width: 340 }}>
        {/* Bar */}
        <div style={{
          width: "100%", height: 2, background: "rgba(255, 255, 255, 0.1)", 
          position: "relative", marginBottom: 12, overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0,
            width: `${progress}%`, background: "#2FE0C8",
            transition: "width 0.2s ease-out",
            boxShadow: "0 0 10px rgba(47, 224, 200, 0.5)"
          }} />
        </div>
        
        {/* Text Details */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, fontFamily: "monospace", color: "#5C616B", letterSpacing: "0.1em" }}>
          <span>{loadingText}</span>
          <span>{progress.toString().padStart(3, '0')}%</span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [aiActive,   setAI]       = useState(false);
  const [activeNav,  setActiveNav] = useState("dashboard");
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isMemoryOpen, setMemoryOpen] = useState(false);
  const [isSoulOpen, setSoulOpen] = useState(false);
  const [isSkillsOpen, setSkillsOpen] = useState(false);
  const [activeTab,  setActiveTab] = useState("voice");
  const [isChatOpen, setChatOpen] = useState(true);
  const [showStartupVideo, setShowStartupVideo] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [hermesStatus, setHermesStatus] = useState<'online' | 'offline' | 'connecting'>('connecting');
  const [hermesPort, setHermesPort] = useState<number | null>(null);

  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.getHermesPort) {
      (window as any).electronAPI.getHermesPort().then((port: number) => {
        setHermesPort(port);
      });
    } else {
      setHermesPort(18789); // fallback
    }
  }, []);

  // ─── Hermes Bridge Health Check ─────────────────────────────────────────────
  useEffect(() => {
    if (!hermesPort) return;
    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      setHermesStatus('connecting');
      try {
        ws = new WebSocket(`ws://127.0.0.1:${hermesPort}`);

        ws.onopen = () => {
          setHermesStatus('online');
        };

        ws.onclose = () => {
          setHermesStatus('offline');
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setHermesStatus('offline');
        };
      } catch (err) {
        setHermesStatus('offline');
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [hermesPort]);

  const handleVideoComplete = () => {
    setShowStartupVideo(false);
    setShowLoadingScreen(true);
  };

  const openSettings = (tabId?: string) => {
    if (tabId) setActiveTab(tabId);
    else setActiveTab("voice");
    setSettingsOpen(true);
  };

  const openModal = (id: string) => {
    if (id === 'settings') openSettings();
    else if (id === 'memory') setMemoryOpen(true);
    else if (id === 'soul') setSoulOpen(true);
    else if (id === 'skills') setSkillsOpen(true);
  };

  return (
    <>
      <style>{G}</style>
      {showStartupVideo ? (
        <StartupScreen onComplete={handleVideoComplete} />
      ) : showLoadingScreen ? (
        <LoadingScreen onComplete={() => setShowLoadingScreen(false)} />
      ) : (
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        background: "#08090C",
        userSelect: "none",
        border: "1px solid #1A1D24",
        borderRadius: 8,
      }}>
        {/* Ambient blobs */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          {[
            { w: 520, h: 520, top: "-120px", left: "22%",  c: "rgba(139,124,246,0.038)" },
            { w: 420, h: 420, bottom: "-60px", right: "18%", c: "rgba(47,224,200,0.03)" },
            { w: 360, h: 360, top: "35%",    right: "6%",  c: "rgba(59,130,246,0.025)" },
          ].map((b, i) => (
            <div key={i} className="blob-float" style={{
              position: "absolute", width: b.w, height: b.h,
              top: (b as any).top, bottom: (b as any).bottom,
              left: (b as any).left, right: (b as any).right,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${b.c} 0%, transparent 68%)`,
              animationDelay: `${i * -5}s`,
            }} />
          ))}
        </div>

        {/* Main content */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <TitleBar />
          <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
            <LeftSidebar activeNav={activeNav} setActiveNav={setActiveNav} onOpenSettings={() => openSettings()} />
            {activeNav === "voice" ? (
              <VoiceAIPage />
            ) : (
              <>
                <OperationsPanel aiActive={aiActive} onToggleAI={() => setAI(v => !v)} onOpenModal={openModal} />
                <ChatPanel aiActive={aiActive} onToggleAI={() => setAI(v => !v)} isOpen={isChatOpen} onToggle={() => setChatOpen(!isChatOpen)} />
              </>
            )}
          </div>

          {/* ─── Status Bar (Bottom) ─── */}
          <div style={{
            height: 26, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 12px",
            background: "#0C0D12",
            borderTop: "1px solid #1A1D24",
            fontSize: 10, fontFamily: "'JetBrains Mono', 'Consolas', monospace",
            color: "#4A4F5C", letterSpacing: "0.03em",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ 
                  width: 6, height: 6, borderRadius: "50%", 
                  background: hermesStatus === 'online' ? "#2FE0C8" : hermesStatus === 'connecting' ? "#F5A623" : "#D0021B", 
                  boxShadow: hermesStatus === 'online' ? "0 0 6px rgba(47,224,200,0.5)" : "none" 
                }} />
                {hermesStatus === 'online' ? "SYSTEM ONLINE" : hermesStatus === 'connecting' ? "CONNECTING..." : "SYSTEM OFFLINE"}
              </span>
              <span>v0.0.1</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: hermesStatus === 'online' ? "#4A4F5C" : "#D0021B" }}>
                HERMES BRIDGE: {hermesStatus === 'online' ? (hermesPort || "...") : "DISCONNECTED"}
              </span>
              <span>DIGI BUSINESS OS</span>
            </div>
          </div>

          <SettingsDialog open={isSettingsOpen} onOpenChange={setSettingsOpen} defaultTab={activeTab} />
          <MemoryDialog open={isMemoryOpen} onOpenChange={setMemoryOpen} />
          <SoulDialog open={isSoulOpen} onOpenChange={setSoulOpen} />
          <SkillsDialog open={isSkillsOpen} onOpenChange={setSkillsOpen} />
        </div>
      </div>
      )}
    </>
  );
}
