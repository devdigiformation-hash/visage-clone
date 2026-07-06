import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import {
  workspacesRepo, commandRunsRepo, fileOpsRepo, useRepo,
  type Workspace, type CommandRun, type FileOp,
} from "@/lib/repo";
import { FolderTree, Plus, Terminal, FileSearch, Play, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/workspaces")({
  head: () => ({ meta: [{ title: "Workspaces · Digi OS" }] }),
  component: WorkspacesPage,
});

const CARD: React.CSSProperties = { background: "#0B0D14", border: "1px solid #1A1D24", borderRadius: 10, padding: 14 };
const INPUT: React.CSSProperties = { width: "100%", background: "#08090C", border: "1px solid #1E2129", color: "#F5F6F8", borderRadius: 6, padding: "6px 8px", fontSize: 12, outline: "none" };
const BTN: React.CSSProperties = { background: "rgba(47,224,200,0.12)", border: "1px solid #2FE0C8", color: "#2FE0C8", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" };
const BTN_GHOST: React.CSSProperties = { background: "transparent", border: "1px solid #1E2129", color: "#9AA0AC", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" };

function WorkspacesPage() {
  const workspaces = useRepo(workspacesRepo);
  const runs = useRepo(commandRunsRepo);
  const ops = useRepo(fileOpsRepo);
  const [activeId, setActiveId] = useState<string>("");
  const [tab, setTab] = useState<"explorer" | "terminal" | "scan" | "history">("explorer");
  const active = workspaces.find((w) => w.id === activeId) || workspaces[0];

  const [newWs, setNewWs] = useState<Partial<Workspace>>({ category: "repo", active: true });
  const [cmd, setCmd] = useState("");

  const addWorkspace = () => {
    if (!newWs.name || !newWs.path) return;
    const w = workspacesRepo.create(newWs);
    setActiveId(w.id);
    setNewWs({ category: "repo", active: true });
  };

  const runCommand = () => {
    if (!cmd.trim() || !active) return;
    const run = commandRunsRepo.create({
      workspaceId: active.id, cwd: active.path, command: cmd,
      status: "success", exitCode: 0,
      output: `[mock] executed \`${cmd}\` in ${active.path}\n(connect a runtime backend to execute real commands)`,
    } as Partial<CommandRun>);
    setCmd("");
    return run;
  };

  const scanWorkspace = () => {
    if (!active) return;
    fileOpsRepo.create({
      workspaceId: active.id, op: "scan", target: active.path,
      detail: `Scanned ${active.path} — inventory placeholder (files, skills, tools, workflows)`,
      status: "done",
    } as Partial<FileOp>);
  };

  return (
    <AppShell>
      <div style={{ padding: "18px 22px", overflowY: "auto", height: "100%", color: "#F5F6F8", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <FolderTree size={20} color="#F5A623" />
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Workspaces</h1>
        </div>
        <p style={{ fontSize: 12, color: "#8A909C", margin: "0 0 18px" }}>
          Register local folders, run scans, execute commands, and let agents operate inside them.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
          {/* Registry */}
          <div style={CARD}>
            <div style={{ fontSize: 11, letterSpacing: ".14em", color: "#5C616B", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>REGISTRY</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {workspaces.map((w) => {
                const isActive = (active?.id === w.id);
                return (
                  <div key={w.id} onClick={() => setActiveId(w.id)}
                    style={{
                      padding: "8px 10px", borderRadius: 6, cursor: "pointer",
                      background: isActive ? "rgba(245,166,35,0.10)" : "transparent",
                      border: `1px solid ${isActive ? "#F5A623" : "#1A1D24"}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "#F5F6F8", fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontSize: 10.5, color: "#5C616B", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.path}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); workspacesRepo.remove(w.id); if (active?.id === w.id) setActiveId(""); }}
                      style={{ background: "transparent", border: "none", color: "#5C616B", cursor: "pointer" }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add form */}
            <div style={{ borderTop: "1px solid #1A1D24", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 10, color: "#5C616B", fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".14em" }}>ADD WORKSPACE</div>
              <input placeholder="Name" value={newWs.name || ""} onChange={(e) => setNewWs({ ...newWs, name: e.target.value })} style={INPUT} />
              <input placeholder="/absolute/path or ~/folder" value={newWs.path || ""} onChange={(e) => setNewWs({ ...newWs, path: e.target.value })} style={INPUT} />
              <select value={newWs.category} onChange={(e) => setNewWs({ ...newWs, category: e.target.value as any })} style={INPUT}>
                <option value="repo">Repo</option><option value="skills">Skills</option>
                <option value="tools">Tools</option><option value="workflows">Workflows</option>
                <option value="assets">Assets</option><option value="client">Client project</option>
                <option value="other">Other</option>
              </select>
              <input placeholder="Tags (comma)" value={newWs.tags || ""} onChange={(e) => setNewWs({ ...newWs, tags: e.target.value })} style={INPUT} />
              <button onClick={addWorkspace} style={BTN}><Plus size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Register</button>
            </div>
          </div>

          {/* Active workspace panel */}
          <div style={CARD}>
            {!active ? (
              <div style={{ color: "#5C616B", fontSize: 12 }}>Select or register a workspace to begin.</div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{active.name}</div>
                    <div style={{ fontSize: 11, color: "#5C616B", fontFamily: "'JetBrains Mono', monospace" }}>{active.path}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#F5A623", border: "1px solid #F5A623", borderRadius: 999, padding: "2px 8px", textTransform: "uppercase", letterSpacing: ".1em" }}>{active.category}</div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1A1D24", marginBottom: 12 }}>
                  {(["explorer","terminal","scan","history"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      color: tab === t ? "#2FE0C8" : "#8A909C", padding: "6px 10px", fontSize: 12,
                      borderBottom: `2px solid ${tab === t ? "#2FE0C8" : "transparent"}`,
                    }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                  ))}
                </div>

                {tab === "explorer" && (
                  <div style={{ fontSize: 12, color: "#8A909C" }}>
                    <div style={{ marginBottom: 8 }}>Folder tree, file inventory, and quick filters will render here once a workspace runtime is connected.</div>
                    <pre style={{ background: "#08090C", border: "1px solid #1A1D24", padding: 10, borderRadius: 6, fontSize: 11, color: "#D2D6E0", overflow: "auto" }}>
{`${active.path}
├── README.md
├── src/
│   ├── agents/
│   ├── tools/
│   └── workflows/
├── skills/
└── package.json`}
                    </pre>
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      <button style={BTN_GHOST}>Open file</button>
                      <button style={BTN_GHOST}>New file</button>
                      <button style={BTN_GHOST}>Rename</button>
                      <button style={BTN_GHOST}>Move / Copy</button>
                      <button style={BTN_GHOST}>Delete</button>
                    </div>
                  </div>
                )}

                {tab === "terminal" && (
                  <div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#2FE0C8", fontSize: 12, padding: "6px 8px" }}>$</div>
                      <input value={cmd} onChange={(e) => setCmd(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") runCommand(); }}
                        placeholder={`command  (cwd: ${active.path})`}
                        style={{ ...INPUT, fontFamily: "'JetBrains Mono', monospace" }} />
                      <button onClick={runCommand} style={BTN}><Play size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Run</button>
                    </div>
                    <div style={{ background: "#08090C", border: "1px solid #1A1D24", borderRadius: 6, padding: 10, minHeight: 200, maxHeight: 320, overflowY: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#D2D6E0" }}>
                      {runs.filter((r) => r.workspaceId === active.id).slice(-30).map((r) => (
                        <div key={r.id} style={{ marginBottom: 10 }}>
                          <div style={{ color: "#2FE0C8" }}>$ {r.command}</div>
                          <div style={{ whiteSpace: "pre-wrap", color: r.status === "failed" ? "#FF5C5C" : "#8A909C" }}>{r.output}</div>
                        </div>
                      ))}
                      {runs.filter((r) => r.workspaceId === active.id).length === 0 && <div style={{ color: "#5C616B" }}># no commands yet</div>}
                    </div>
                    <div style={{ fontSize: 10.5, color: "#5C616B", marginTop: 6 }}>
                      Executor runs are recorded here. Wire a local runtime (Electron / desktop agent / API) to execute real commands.
                    </div>
                  </div>
                )}

                {tab === "scan" && (
                  <div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      <button onClick={scanWorkspace} style={BTN}><FileSearch size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Scan workspace</button>
                      <button style={BTN_GHOST}>Detect skills</button>
                      <button style={BTN_GHOST}>Detect tools</button>
                      <button style={BTN_GHOST}>Detect workflows</button>
                    </div>
                    <div style={{ fontSize: 12, color: "#8A909C" }}>Scan reports:</div>
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                      {ops.filter((o) => o.workspaceId === active.id && o.op === "scan").map((o) => (
                        <div key={o.id} style={{ background: "#08090C", border: "1px solid #1A1D24", borderRadius: 6, padding: 8, fontSize: 11, color: "#D2D6E0" }}>
                          <div style={{ color: "#F5A623", fontFamily: "'JetBrains Mono', monospace" }}>{new Date(o.createdAt).toLocaleString()}</div>
                          <div>{o.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "history" && (
                  <div style={{ fontSize: 12 }}>
                    <div style={{ color: "#8A909C", marginBottom: 8 }}>File operations</div>
                    {ops.filter((o) => o.workspaceId === active.id).slice(-40).reverse().map((o) => (
                      <div key={o.id} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid #14161C" }}>
                        <span style={{ color: "#2FE0C8", width: 60, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{o.op}</span>
                        <span style={{ color: "#D2D6E0", flex: 1 }}>{o.target}</span>
                        <span style={{ color: "#5C616B", fontSize: 11 }}>{o.status}</span>
                      </div>
                    ))}
                    {ops.filter((o) => o.workspaceId === active.id).length === 0 && <div style={{ color: "#5C616B" }}>No file operations recorded.</div>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
