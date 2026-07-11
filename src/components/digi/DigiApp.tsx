// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import {
  Brain, Heart, Settings, Zap,
  Monitor, Bot, Camera, Wrench,
} from "lucide-react";

import { SettingsDialog } from "./SettingsDialog";
import { MemoryDialog } from "./MemoryDialog";
import { SoulDialog } from "./SoulDialog";
import { SkillsDialog } from "./SkillsDialog";
import { useNavigate } from "@tanstack/react-router";

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

// ─── Data ─────────────────────────────────────────────────────────────────────
const NODES = [
  { id: "memory",   label: "Memory",   Icon: Brain,    color: "#8B7CF6", bg: "rgba(139,124,246,0.12)", glow: "rgba(139,124,246,0.22)", badge: "HIGH" },
  { id: "soul",     label: "Soul",     Icon: Heart,    color: "#2FE0C8", bg: "rgba(47,224,200,0.12)",  glow: "rgba(47,224,200,0.22)",  badge: "HIGH" },
  { id: "skills",   label: "Skills",   Icon: Zap,      color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  glow: "rgba(59,130,246,0.22)",  badge: "MED"  },
  { id: "settings", label: "Settings", Icon: Settings, color: "#EF4444", bg: "rgba(239,68,68,0.08)",   glow: "rgba(239,68,68,0.15)",   badge: "LOW"  },
];

// ─── Layout constants (must be identical across ConnectorSVG & OperationsPanel)
const C_PAD      = 12;
const C_CARD_W   = 44;   // square
const C_CARD_H   = 44;   // square
const C_CARD_GAP = 12; // legacy
const C_LABEL_H  = 14;
const C_LABEL_GAP = 6;
const C_ITEM_H   = C_CARD_H + C_LABEL_GAP + C_LABEL_H; // card + label
const C_ITEM_GAP = 14;                                  // gap between full items
const C_ROW_STEP = C_ITEM_H + C_ITEM_GAP;               // one full row
const C_LEFT_STACK_X = 16;  // hug the left wall (was 40)
const C_GLOBE_Y_RATIO = 0.50;

// Right-side outgoing wires — separate palette from left input modules.
const RIGHT_WIRES = [
  { color: "#C4B5FD", glow: "rgba(196,181,253,0.55)" }, // violet — Camera
  { color: "#F5A623", glow: "rgba(245,166,35,0.55)"  }, // amber  — Screen Share
  { color: "#F472B6", glow: "rgba(244,114,182,0.55)" }, // rose   — Agent
  { color: "#7DD3FC", glow: "rgba(125,211,252,0.55)" }, // sky    — Workflow
];

// Right-side action cards — mirror of NODES for row-by-row symmetry.
const ACTIONS = [
  { id: "camera",   label: "Camera",       Icon: Camera,   color: RIGHT_WIRES[0].color, bg: "rgba(196,181,253,0.12)", glow: RIGHT_WIRES[0].glow },
  { id: "screen",   label: "Screen Share", Icon: Monitor,  color: RIGHT_WIRES[1].color, bg: "rgba(245,166,35,0.12)",  glow: RIGHT_WIRES[1].glow },
  { id: "agent",    label: "Agent",        Icon: Bot,      color: RIGHT_WIRES[2].color, bg: "rgba(244,114,182,0.12)", glow: RIGHT_WIRES[2].glow },
  { id: "tools",    label: "Tools",        Icon: Wrench,   color: RIGHT_WIRES[3].color, bg: "rgba(125,211,252,0.12)", glow: RIGHT_WIRES[3].glow },
];
const PLANET_R   = 700;

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
        // Standby: soft controlled ambient glow — visible but not bright.
        const g = cx.createRadialGradient(W/2, H/2, 0, W/2, H/2, PLANET_R * 0.7);
        g.addColorStop(0, "rgba(16,185,129,0.13)");
        g.addColorStop(0.5, "rgba(4,120,87,0.06)");
        g.addColorStop(1, "transparent");
        cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      }

      // NOTE: The former filled inner ellipse + clipped horizontal bands were
      // removed — they created a visible "globe inside a globe" behind the
      // projected particle sphere. The particle sphere itself IS the globe,
      // and the surrounding ring particles provide the single Jupiter-style
      // outer atmospheric band layer.


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
        let op = active ? 0.2 + d * 0.8 : 0.28 + d * 0.55;
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
        cx.fillStyle = `rgba(${cr},${cg},${cb},${active ? op : op * 0.85})`;
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
function ConnectorSVG({ active, W, H, globeSize, globeCenterX, rightActionX, rightButtonYs }: { active: boolean; W: number; H: number; globeSize: number; globeCenterX: number; rightActionX: number; rightButtonYs: number[] }) {
  const nodeX = C_LEFT_STACK_X + C_CARD_W;                    // right edge of card column
  // Globe is now the true center hub of the Operations Status composition.
  const visualPlanetR = Math.round(globeSize * 0.43);
  const orbEdgeX = globeCenterX - visualPlanetR;
  const orbRightEdgeX = globeCenterX + visualPlanetR;
  const midX  = Math.round(nodeX + (orbEdgeX - nodeX) * 0.70);
  const midY  = Math.round(H * C_GLOBE_Y_RATIO);
  // Right-side junction — mirror of the left junction
  const rMidX = Math.round(orbRightEdgeX + (rightActionX - orbRightEdgeX) * 0.30);
  const rMidY = midY;
  const nodeCardsTotalH = NODES.length * C_ITEM_H + (NODES.length - 1) * C_ITEM_GAP;
  const startY = midY - nodeCardsTotalH / 2;
  const ys    = NODES.map((_, i) => startY + i * C_ROW_STEP + Math.round(C_CARD_H / 2));

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

      {/* Orb entry dot (left) */}
      <circle cx={orbEdgeX} cy={midY} r="3.5" fill="#0D0F14" stroke="#2FE0C8" strokeWidth="1.5" opacity="0.85" />
      <circle cx={orbEdgeX} cy={midY} r="1.6" fill="#2FE0C8" opacity={active ? "0.9" : "0.5"} />

      {/* ─── Right-side wires: globe → right junction → 4 action buttons ─── */}
      <defs>
        {RIGHT_WIRES.map((_, i) => (
          <filter key={`rf-${i}`} id={`rcf${i}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        ))}
        <radialGradient id="rjunc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity={active ? "0.85" : "0.35"} />
          <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Orb → right junction */}
      {(() => {
        const d3 = `M ${orbRightEdgeX} ${midY} C ${orbRightEdgeX + Math.round((rMidX-orbRightEdgeX)*0.4)} ${midY}, ${rMidX - Math.round((rMidX-orbRightEdgeX)*0.2)} ${rMidY}, ${rMidX} ${rMidY}`;
        return (
          <g>
            <path d={d3} fill="none" stroke="#C4B5FD" strokeWidth="2.5" opacity="0.06" />
            <path id="rncmain" d={d3} fill="none" stroke="#C4B5FD" strokeWidth="1.5"
              opacity={active ? 0.6 : 0.22} filter="url(#cfmain)" />
            <circle r="2.5" fill="#C4B5FD" opacity={active ? "1" : "0.55"}>
              <animateMotion dur="1.7s" repeatCount="indefinite">
                <mpath href="#rncmain" />
              </animateMotion>
            </circle>
          </g>
        );
      })()}

      {/* Right junction node */}
      <circle cx={rMidX} cy={rMidY} r="10" fill="url(#rjunc)" opacity={active ? "0.5" : "0.18"} />
      <circle cx={rMidX} cy={rMidY} r="5.5" fill="#0D0F14" stroke="#22252D" strokeWidth="1.5" />
      <circle cx={rMidX} cy={rMidY} r="2.5" fill="#C4B5FD" opacity={active ? "0.95" : "0.5"}>
        <animate attributeName="r" values={active ? "2;3.5;2" : "1.8;2.8;1.8"} dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Right junction → 4 buttons */}
      {rightButtonYs.map((by, i) => {
        const col = RIGHT_WIRES[i].color;
        const pid = `rnc${i}`;
        const btnX = rightActionX;
        const c1x = Math.round(rMidX + (btnX - rMidX) * 0.26);
        const c2x = Math.round(rMidX + (btnX - rMidX) * 0.62);
        const d   = `M ${rMidX} ${rMidY} C ${c1x} ${rMidY}, ${c2x} ${by}, ${btnX} ${by}`;
        return (
          <g key={`rw-${i}`}>
            <path d={d} fill="none" stroke={col} strokeWidth="2.5" opacity={active ? "0.2" : "0.06"} />
            <path id={pid} d={d} fill="none" stroke={col} strokeWidth={active ? "1.8" : "1.2"}
              opacity={active ? 0.85 : 0.25} filter={`url(#rcf${i})`} />
            <circle cx={btnX} cy={by} r={active ? "4.5" : "3.5"} fill="#0D0F14" stroke={col} strokeWidth="1.5" opacity="0.88" />
            <circle cx={btnX} cy={by} r={active ? "2.5" : "1.6"} fill={col} opacity={active ? "1" : "0.55"}>
              <animate attributeName="opacity" values={active ? "0.8;1;0.8" : "0.3;0.6;0.3"} dur="1s" repeatCount="indefinite" />
            </circle>
            <circle r={active ? "3" : "2"} fill={col} opacity={active ? "1" : "0.5"}>
              <animateMotion dur={`${2.5 + i * 0.45}s`} repeatCount="indefinite" begin={`${i * 0.55}s`}>
                <mpath href={`#${pid}`} />
              </animateMotion>
            </circle>
          </g>
        );
      })}
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



// ─── Operations Panel ─────────────────────────────────────────────────────────
function OperationsPanel({ aiActive, onToggleAI, onOpenModal }: { aiActive: boolean; onToggleAI: () => void; onOpenModal: (type: 'memory'|'soul'|'skills'|'settings') => void; }) {
  const navigate = useNavigate();

  const [activeNode, setActiveNode] = useState<string | null>("soul");
  const [cameraOn, setCameraOn] = useState(false);
  const [screenShareOn, setScreenShareOn] = useState(false);

  // Frontend-only toggle handlers — purely visual, no media capture, no backend.
  const toggleCamera = () => { playUISound('click'); setCameraOn(v => !v); };
  const toggleScreenShare = () => { playUISound('click'); setScreenShareOn(v => !v); };

  const panelRef = useRef<HTMLDivElement>(null);
  const [dims,  setDims]  = useState({ w: 600, h: 640 });

  useEffect(() => {
    const el = panelRef.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setDims({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
    ro.observe(el);
    setDims({ w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) });
    return () => ro.disconnect();
  }, []);

  // Computed height — fill the entire panel so the globe is truly window-centered
  const baseNodeMapH = NODES.length * C_ITEM_H + (NODES.length - 1) * C_ITEM_GAP + C_PAD * 2;
  const nodeMapH = Math.max(baseNodeMapH + 220, dims.h);
  const globeSize = Math.min(390, Math.max(330, Math.round(Math.min(dims.w * 0.47, nodeMapH * 0.58))));
  const globeCenterY = Math.round(nodeMapH * C_GLOBE_Y_RATIO);
  const nodeCardsTotalH = NODES.length * C_ITEM_H + (NODES.length - 1) * C_ITEM_GAP;
  const nodeCardsTop = Math.round(globeCenterY - nodeCardsTotalH / 2);
  // Right stack is a strict mirror of the left stack so both sides sit at
  // identical distances from the globe center and share the same wire geometry.
  const rightContainerLeft = dims.w - C_LEFT_STACK_X - 84;
  const rightActionStackX = dims.w - C_LEFT_STACK_X - C_CARD_W; // mirror of (C_LEFT_STACK_X + C_CARD_W) -> wire endpoint
  const globeCenterX = Math.round(dims.w / 2);
  const cardCenterYs = [0, 1, 2, 3].map(i => nodeCardsTop + i * C_ROW_STEP + Math.round(C_CARD_H / 2));

  return (
    <div ref={panelRef} style={{
      flex: 1, minWidth: 0,
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>


      {/* ── Node map ── */}
      <div style={{
        position: "relative", flexShrink: 0, height: nodeMapH,
        overflow: "visible",
      }}>
        <ConnectorSVG
          active={aiActive}
          W={dims.w}
          H={nodeMapH}
          globeSize={globeSize}
          globeCenterX={globeCenterX}
          rightActionX={rightActionStackX}
          rightButtonYs={cardCenterYs}
        />

        {/* Left node stack — icons + labels, absolutely positioned to card centers */}
        {NODES.map((n, i) => {
          const lit = activeNode === n.id;
          const cy = cardCenterYs[i];
          return (
            <div key={n.id} style={{
              position: "absolute",
              top: cy - C_CARD_H / 2,
              left: C_LEFT_STACK_X,
              width: 84,
              display: "flex", flexDirection: "column", alignItems: "center",
              zIndex: 10,
            }}>
              <button
                onClick={() => {
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
                  transform: lit ? "translateY(-1px)" : "none",
                  background: lit ? n.bg : "transparent",
                  border: lit ? `1px solid ${n.color}40` : "1px solid transparent",
                  boxShadow: lit ? `0 0 14px ${n.glow}` : "none",
                }}
                title={n.label}
              >
                <n.Icon size={20} style={{ color: lit ? n.color : "#8A909E" }} />
              </button>
              <span style={{
                marginTop: C_LABEL_GAP,
                fontSize: 9.5,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: lit ? "#E8EAF0" : "#5C616B",
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}>{n.label}</span>
            </div>
          );
        })}

        {/* Right action stack — perfect mirror of the left stack */}
        {ACTIONS.map((a, i) => {
          const cy = cardCenterYs[i];
          const isCam = a.id === "camera";
          const isScr = a.id === "screen";
          const lit = (isCam && cameraOn) || (isScr && screenShareOn);
          const onClick =
            isCam ? toggleCamera :
            isScr ? toggleScreenShare :
            a.id === "agent" ? () => { playUISound('click'); navigate({ to: "/agents" }); } :
            a.id === "tools" ? () => { playUISound('click'); navigate({ to: "/tools" }); } :
                               () => { playUISound('click'); };

          return (
            <div key={a.id} style={{
              position: "absolute",
              top: cy - C_CARD_H / 2,
              left: rightContainerLeft,
              width: 84,
              display: "flex", flexDirection: "column", alignItems: "center",
              zIndex: 10,
            }}>
              <button
                onClick={onClick}
                onMouseEnter={() => playUISound('hover')}
                title={a.label}
                className={lit ? "glass-btn-active" : "glass-btn"}
                style={{
                  height: C_CARD_H, width: C_CARD_W,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 10,
                  cursor: "pointer",
                  transform: lit ? "translateY(-1px)" : "none",
                  background: lit ? a.bg : "transparent",
                  border: lit ? `1px solid ${a.color}55` : "1px solid transparent",
                  boxShadow: lit ? `0 0 14px ${a.glow}` : "none",
                }}
              >
                <a.Icon size={20} style={{ color: lit ? a.color : "#8A909E" }} />
              </button>
              <span style={{
                marginTop: C_LABEL_GAP,
                fontSize: 9.5,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: lit ? "#E8EAF0" : "#5C616B",
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}>{a.label}</span>
            </div>
          );
        })}

        {/* Visual-only camera/screen indicator (frontend template — no capture) */}
        {(cameraOn || screenShareOn) && (
          <div style={{
            position: "absolute",
            top: globeCenterY - Math.round(globeSize / 2) - 18,
            left: globeCenterX - Math.round(globeSize / 2) - 22,
            display: "flex", flexDirection: "column", gap: 6, zIndex: 30, pointerEvents: "none"
          }}>
            {cameraOn && (
              <div style={{ width: 90, height: 68, borderRadius: 6, border: "1px solid rgba(47,224,200,0.4)", background: "linear-gradient(135deg,#050608,#0F1620)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2FE0C8", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>
                CAM · PREVIEW
              </div>
            )}
            {screenShareOn && (
              <div style={{ width: 90, height: 60, borderRadius: 6, border: "1px solid rgba(47,224,200,0.4)", background: "linear-gradient(135deg,#050608,#0F1620)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2FE0C8", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>
                SCREEN · PREVIEW
              </div>
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

        {/* Center stack: globe + Start AI button */}
        <div style={{
          position: "absolute",
          left: globeCenterX,
          top: globeCenterY - globeSize / 2,
          transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 4,
          zIndex: 20,
          pointerEvents: "auto",
        }}>
          <div
            style={{ position: "relative", width: globeSize, height: globeSize }}
          >
            <div className={aiActive ? "orb-breathe" : ""}
              style={{
                position: "absolute", width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                filter: aiActive
                  ? "drop-shadow(0 0 40px rgba(47,224,200,0.55))"
                  : "drop-shadow(0 0 16px rgba(47,224,200,0.18)) drop-shadow(0 0 6px rgba(210,225,240,0.10))",
                pointerEvents: "none",
                transition: "filter 0.5s ease",
                opacity: 1,
              }}>
              <ParticleOrb active={aiActive} />
            </div>
          </div>

          {/* SYSTEM STANDBY label — hides when AI is active */}
          <div style={{
            height: 16,
            marginTop: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#5C616B",
            opacity: aiActive ? 0 : 1,
            transition: "opacity 0.35s ease",
            pointerEvents: "none",
          }}>
            System Standby
          </div>

          <button
            onClick={() => { playUISound('powerup'); onToggleAI(); }}
            onMouseEnter={() => playUISound('hover')}
            className={aiActive ? "glass-btn" : "glass-btn-active"}
            style={{
              marginTop: 8,
              padding: "8px 38px", borderRadius: 24,
              fontSize: 13, fontWeight: 600,
              color: aiActive ? "#FF5C5C" : "#34D399",
              cursor: "pointer",
              background: "rgba(10, 15, 20, 0.8)",
              border: "1px solid rgba(52, 211, 153, 0.2)"
            }}
            onMouseOver={(e) => { if (!aiActive) e.currentTarget.style.boxShadow = "0 0 15px rgba(52, 211, 153, 0.2)"; }}
            onMouseOut={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          >
            {aiActive ? "STOP AI" : "START AI"}
          </button>
        </div>
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
  const [aiActive, setAI] = useState(false);
  const [activeNav] = useState("dashboard");
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isMemoryOpen, setMemoryOpen] = useState(false);
  const [isSoulOpen, setSoulOpen] = useState(false);
  const [isSkillsOpen, setSkillsOpen] = useState(false);
  const [showStartupVideo, setShowStartupVideo] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  const handleVideoComplete = () => {
    setShowStartupVideo(false);
    setShowLoadingScreen(true);
  };

  const openSettings = (_tabId?: string) => {
    // Route to the real /settings page (13-section OpenClaw-level system settings)
    if (typeof window !== "undefined") window.location.href = "/settings";
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
          <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
            {activeNav === "voice" ? (
              <VoiceAIPage />
            ) : (
              <OperationsPanel aiActive={aiActive} onToggleAI={() => setAI(v => !v)} onOpenModal={openModal} />
            )}
          </div>


          <SettingsDialog open={isSettingsOpen} onOpenChange={setSettingsOpen} />
          <MemoryDialog open={isMemoryOpen} onOpenChange={setMemoryOpen} />
          <SoulDialog open={isSoulOpen} onOpenChange={setSoulOpen} />
          <SkillsDialog open={isSkillsOpen} onOpenChange={setSkillsOpen} />
          
        </div>
      </div>
      )}
    </>
  );
}
