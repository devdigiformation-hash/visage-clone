import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { knowledgeItemsRepo, useRepo, TAXONOMY, type KnowledgeItem } from "@/lib/repo";
import { BookOpen, Plus, Trash2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Base · Digi OS" },
      { name: "description", content: "Categorized knowledge hub powering agents, skills, tools, workflows and coding operations." },
    ],
  }),
  component: KnowledgePage,
});

const ACCENT = "#2FE0C8";
const CATS = Object.keys(TAXONOMY.knowledge);

function KnowledgePage() {
  const items = useRepo(knowledgeItemsRepo);
  const [activeCat, setActiveCat] = useState<string>(CATS[0]);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const subs = useMemo(() => (TAXONOMY.knowledge as any)[activeCat] as string[] ?? [], [activeCat]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (it.category !== activeCat) return false;
      if (activeSub && it.subcategory !== activeSub) return false;
      if (q && !(`${it.title} ${it.content} ${it.tags ?? ""}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [items, activeCat, activeSub, q]);

  const selected = items.find((i) => i.id === selectedId) ?? filtered[0];

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    items.forEach((it) => { m[it.category] = (m[it.category] ?? 0) + 1; });
    return m;
  }, [items]);

  return (
    <AppShell>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Header */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #1A1D24", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BookOpen size={18} color={ACCENT} />
            <div>
              <div style={{ fontSize: 14, color: "#F5F6F8", fontWeight: 600 }}>Knowledge Base</div>
              <div style={{ fontSize: 11, color: "#8A909C" }}>Categorized knowledge powering agents, skills, tools & workflows.</div>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} style={btn(ACCENT)}>
            <Plus size={12} /> Add entry
          </button>
        </div>

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "220px 260px 1fr", minHeight: 0 }}>
          {/* Category tree */}
          <div style={{ borderRight: "1px solid #1A1D24", overflowY: "auto", padding: 8 }} className="custom-scroll">
            <SectionLabel>Categories</SectionLabel>
            {CATS.map((c) => (
              <div key={c}>
                <button
                  onClick={() => { setActiveCat(c); setActiveSub(null); setSelectedId(null); }}
                  style={catBtn(c === activeCat)}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c}</span>
                  <span style={{ fontSize: 10, color: "#5C616B" }}>{counts[c] ?? 0}</span>
                </button>
                {c === activeCat && subs.length > 0 && (
                  <div style={{ paddingLeft: 12, marginBottom: 4 }}>
                    <button onClick={() => setActiveSub(null)} style={subBtn(activeSub === null)}>All</button>
                    {subs.map((s) => (
                      <button key={s} onClick={() => setActiveSub(s)} style={subBtn(activeSub === s)}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Item list */}
          <div style={{ borderRight: "1px solid #1A1D24", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ padding: 10, borderBottom: "1px solid #1A1D24", display: "flex", alignItems: "center", gap: 6 }}>
              <Search size={12} color="#5C616B" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search entries…"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F5F6F8", fontSize: 12 }}
              />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 6 }} className="custom-scroll">
              {filtered.length === 0 && (
                <div style={{ padding: 12, fontSize: 11, color: "#5C616B" }}>No entries in this category yet.</div>
              )}
              {filtered.map((it) => (
                <div
                  key={it.id}
                  onClick={() => setSelectedId(it.id)}
                  style={{
                    padding: "8px 10px", marginBottom: 4, borderRadius: 6, cursor: "pointer",
                    background: (selected?.id === it.id) ? "rgba(47,224,200,0.10)" : "transparent",
                    border: "1px solid " + ((selected?.id === it.id) ? "rgba(47,224,200,0.35)" : "#1A1D24"),
                  }}
                >
                  <div style={{ fontSize: 12, color: "#F5F6F8" }}>{it.title}</div>
                  <div style={{ fontSize: 10, color: "#8A909C", marginTop: 2 }}>
                    {it.format} · {it.subcategory ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            {selected ? (
              <KnowledgeDetail item={selected} onDelete={() => { knowledgeItemsRepo.remove(selected.id); setSelectedId(null); }} />
            ) : (
              <div style={{ padding: 24, fontSize: 12, color: "#5C616B" }}>Select an entry.</div>
            )}
          </div>
        </div>

        {showAdd && <AddEntry defaultCategory={activeCat} onClose={() => setShowAdd(false)} />}
      </div>
    </AppShell>
  );
}

function KnowledgeDetail({ item, onDelete }: { item: KnowledgeItem; onDelete: () => void }) {
  const [content, setContent] = useState(item.content);
  const [title, setTitle] = useState(item.title);
  const [subcategory, setSubcategory] = useState(item.subcategory ?? "");
  const [tags, setTags] = useState(item.tags ?? "");

  const save = () => knowledgeItemsRepo.update(item.id, { title, content, subcategory, tags });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1A1D24", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={save}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F5F6F8", fontSize: 14, fontWeight: 600 }} />
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={save} style={btn(ACCENT)}>Save</button>
          <button onClick={onDelete} style={{ ...btn("#EF4444"), background: "transparent", color: "#EF4444", border: "1px solid #EF4444" }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #1A1D24", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Meta label="Category" value={item.category} />
        <Meta label="Format" value={item.format} />
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: "#8A909C" }}>
          Subcategory
          <input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} onBlur={save} style={inp} />
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: "#8A909C" }}>
          Tags
          <input value={tags} onChange={(e) => setTags(e.target.value)} onBlur={save} style={inp} />
        </label>
      </div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} onBlur={save}
        style={{ flex: 1, background: "#08090C", border: "none", outline: "none", color: "#D2D6E0",
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: 16, resize: "none" }} />
    </div>
  );
}

function AddEntry({ defaultCategory, onClose }: { defaultCategory: string; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [subcategory, setSubcategory] = useState("");
  const [format, setFormat] = useState<KnowledgeItem["format"]>("markdown");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const subs = (TAXONOMY.knowledge as any)[category] as string[] ?? [];

  const submit = () => {
    if (!title.trim()) return;
    knowledgeItemsRepo.create({ title, category, subcategory, format, content, tags, active: true });
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "min(520px, calc(100vw - 2rem))", maxHeight: "calc(100dvh - 2rem)", overflow: "auto", background: "#0A0C12", border: "1px solid #1A1D24", borderRadius: 8, padding: 18 }}>
        <button
          onClick={onClose}
          aria-label="Close"
          title="Close"
          style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: 6, background: "rgba(0,0,0,0.3)", border: "1px solid #1A1D24", color: "#C4C8D0", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
        >
          <X size={14} />
        </button>
        <div style={{ fontSize: 13, color: "#F5F6F8", fontWeight: 600, marginBottom: 10, paddingRight: 36 }}>New knowledge entry</div>
        <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} style={inp2} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inp2}>
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Subcategory">
            <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} style={inp2}>
              <option value="">—</option>
              {subs.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Format">
          <select value={format} onChange={(e) => setFormat(e.target.value as any)} style={inp2}>
            {["markdown", "snippet", "reference", "sop", "prompt", "link"].map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Content"><textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} style={{ ...inp2, resize: "vertical", fontFamily: "'JetBrains Mono', monospace" }} /></Field>
        <Field label="Tags"><input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma,separated" style={inp2} /></Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
          <button onClick={onClose} style={{ ...btn("#5C616B"), background: "transparent", color: "#8A909C", border: "1px solid #1A1D24" }}>Cancel</button>
          <button onClick={submit} style={btn(ACCENT)}>Create</button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: any }) {
  return <div style={{ padding: "6px 8px 4px", fontSize: 9.5, letterSpacing: "0.16em", color: "#5C616B", fontFamily: "'JetBrains Mono', monospace" }}>{children}</div>;
}
function Meta({ label, value }: { label: string; value: string }) {
  return <div style={{ fontSize: 11, color: "#8A909C" }}>{label}: <span style={{ color: "#D2D6E0" }}>{value}</span></div>;
}
function Field({ label, children }: { label: string; children: any }) {
  return (
    <label style={{ display: "block", marginBottom: 8 }}>
      <div style={{ fontSize: 10, color: "#8A909C", marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      {children}
    </label>
  );
}

const btn = (color: string): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", fontSize: 11,
  background: color, color: "#0A0C12", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600,
});
const catBtn = (active: boolean): React.CSSProperties => ({
  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "6px 8px", background: active ? "rgba(47,224,200,0.10)" : "transparent",
  border: "none", color: active ? "#F5F6F8" : "#8A909C", fontSize: 11.5, cursor: "pointer",
  borderRadius: 5, marginBottom: 2, borderLeft: `2px solid ${active ? ACCENT : "transparent"}`,
});
const subBtn = (active: boolean): React.CSSProperties => ({
  display: "block", width: "100%", textAlign: "left", padding: "4px 8px",
  background: "transparent", border: "none", cursor: "pointer",
  fontSize: 11, color: active ? ACCENT : "#8A909C", borderRadius: 4,
});
const inp: React.CSSProperties = { background: "#08090C", border: "1px solid #1A1D24", color: "#F5F6F8", fontSize: 11, padding: "3px 6px", borderRadius: 4, outline: "none" };
const inp2: React.CSSProperties = { width: "100%", background: "#08090C", border: "1px solid #1A1D24", color: "#F5F6F8", fontSize: 12, padding: "6px 8px", borderRadius: 4, outline: "none" };
