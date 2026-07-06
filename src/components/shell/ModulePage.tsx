import { useState, type ReactNode } from "react";
import { Plus, Search, X, Trash2, Edit3, Upload } from "lucide-react";
import type { Entity, createRepo } from "@/lib/repo";
import { useRepo } from "@/lib/repo";

type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "toggle" | "number";
  options?: string[];
  placeholder?: string;
};

export function ModulePage<T extends Entity>({
  title, description, icon, accent, repo, fields, columns, extraActions,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  accent: string;
  repo: ReturnType<typeof createRepo<T>>;
  fields: Field[];
  columns: { key: string; label: string; render?: (row: T) => ReactNode }[];
  extraActions?: ReactNode;
}) {
  const items = useRepo(repo);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<T | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);

  const filtered = items.filter((it) =>
    !q || JSON.stringify(it).toLowerCase().includes(q.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (row: T) => { setEditing(row); setShowForm(true); };
  const save = (data: any) => {
    if (editing) repo.update(editing.id, data);
    else repo.create(data);
    setShowForm(false); setEditing(null);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "18px 24px", borderBottom: "1px solid #1A1D24",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16,
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent)",
      }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: `${accent}18`, border: `1px solid ${accent}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 20px ${accent}20`,
          }}>{icon}</div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "#F5F6F8", margin: 0, letterSpacing: "-0.01em" }}>{title}</h1>
            <p style={{ fontSize: 12, color: "#7A8090", margin: "3px 0 0" }}>{description}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {extraActions}
          <button onClick={() => setShowBulk(true)} style={btnGhost} title="Bulk import JSON">
            <Upload size={12} /> Import
          </button>
          <button onClick={openCreate} style={btnPrimary(accent)}>
            <Plus size={13} /> New
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #12151C" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#5C616B" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." style={{
            width: "100%", padding: "7px 10px 7px 30px", fontSize: 12,
            background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 6, color: "#F5F6F8", outline: "none",
          }} />
        </div>
        <span style={{ fontSize: 11, color: "#5C616B", fontFamily: "'JetBrains Mono', monospace" }}>{filtered.length} of {items.length}</span>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 12px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#5C616B", marginBottom: 12 }}>No items yet.</p>
            <button onClick={openCreate} style={btnPrimary(accent)}><Plus size={13} /> Create first</button>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1A1D24" }}>
                {columns.map((c) => (
                  <th key={c.key} style={{ textAlign: "left", padding: "10px 12px", fontSize: 10, letterSpacing: "0.1em", color: "#5C616B", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{c.label}</th>
                ))}
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #12151C", transition: "background .15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  {columns.map((c) => (
                    <td key={c.key} style={{ padding: "10px 12px", color: "#C8CCD4" }}>
                      {c.render ? c.render(row) : String((row as any)[c.key] ?? "—")}
                    </td>
                  ))}
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    <button onClick={() => openEdit(row)} style={iconBtn}><Edit3 size={12} /></button>
                    <button onClick={() => confirm("Delete?") && repo.remove(row.id)} style={{ ...iconBtn, color: "#FF5C5C" }}><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <EntityForm
          title={editing ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}
          accent={accent}
          fields={fields}
          initial={editing ?? undefined}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          onSave={save}
        />
      )}
    </div>
  );
}

function EntityForm({ title, accent, fields, initial, onCancel, onSave }: {
  title: string; accent: string; fields: Field[]; initial?: any;
  onCancel: () => void; onSave: (data: any) => void;
}) {
  const [data, setData] = useState<any>(initial ?? Object.fromEntries(fields.map((f) => [f.key, f.type === "toggle" ? false : ""])));
  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      backdropFilter: "blur(8px)",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 520, maxHeight: "85vh", overflow: "auto",
        background: "#0D1017", border: "1px solid #1A1D24", borderRadius: 12,
        boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${accent}20`,
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1A1D24", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#F5F6F8", margin: 0 }}>{title}</h2>
          <button onClick={onCancel} style={iconBtn}><X size={14} /></button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {fields.map((f) => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 10.5, color: "#7A8090", letterSpacing: "0.06em", marginBottom: 5, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{f.label}</label>
              {f.type === "textarea" ? (
                <textarea value={data[f.key] ?? ""} onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                  rows={4} placeholder={f.placeholder}
                  style={inputStyle} />
              ) : f.type === "select" ? (
                <select value={data[f.key] ?? ""} onChange={(e) => setData({ ...data, [f.key]: e.target.value })} style={inputStyle}>
                  <option value="">—</option>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === "toggle" ? (
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!data[f.key]} onChange={(e) => setData({ ...data, [f.key]: e.target.checked })} />
                  <span style={{ fontSize: 12, color: "#C8CCD4" }}>{data[f.key] ? "Enabled" : "Disabled"}</span>
                </label>
              ) : (
                <input type={f.type ?? "text"} value={data[f.key] ?? ""} onChange={(e) => setData({ ...data, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                  placeholder={f.placeholder} style={inputStyle} />
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid #1A1D24", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onCancel} style={btnGhost}>Cancel</button>
          <button onClick={() => onSave(data)} style={btnPrimary(accent)}>Save</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", fontSize: 12,
  background: "#0A0C12", border: "1px solid #1A1D24", borderRadius: 6,
  color: "#F5F6F8", outline: "none", fontFamily: "inherit",
};
const iconBtn: React.CSSProperties = {
  background: "transparent", border: "none", color: "#7A8090",
  padding: 6, borderRadius: 4, cursor: "pointer", marginLeft: 4,
};
const btnGhost: React.CSSProperties = {
  padding: "7px 14px", fontSize: 12, borderRadius: 6,
  background: "transparent", border: "1px solid #1A1D24", color: "#8A909C", cursor: "pointer",
};
const btnPrimary = (accent: string): React.CSSProperties => ({
  padding: "7px 14px", fontSize: 12, fontWeight: 500, borderRadius: 6,
  background: `${accent}20`, border: `1px solid ${accent}60`, color: accent, cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
});

export function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px",
      fontSize: 10, letterSpacing: "0.06em", borderRadius: 4,
      background: `${color}18`, border: `1px solid ${color}40`, color,
      fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
      {label}
    </span>
  );
}
