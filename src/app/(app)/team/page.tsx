"use client";
import { useState, useEffect } from "react";
import { teamStorage, type TeamMember } from "@/lib/teamStorage";
import { Users, Plus, Trash2, Edit2, Check, X, Copy, CheckCircle } from "lucide-react";

const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Operations", "Legal", "Finance", "Other"];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", address: "", department: "" });
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { setMembers(teamStorage.getAll()); }, []);

  const save = () => {
    if (!form.label.trim() || !form.address.trim()) return;
    if (editingId) {
      teamStorage.update(editingId, form);
    } else {
      teamStorage.save(form);
    }
    setMembers(teamStorage.getAll());
    setForm({ label: "", address: "", department: "" });
    setShowAdd(false);
    setEditingId(null);
  };

  const remove = (id: string) => {
    teamStorage.remove(id);
    setMembers(teamStorage.getAll());
  };

  const startEdit = (m: TeamMember) => {
    setForm({ label: m.label, address: m.address, department: m.department || "" });
    setEditingId(m.id);
    setShowAdd(true);
  };

  const copyAddr = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(addr);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = members.filter(m =>
    m.label.toLowerCase().includes(search.toLowerCase()) ||
    m.address.toLowerCase().includes(search.toLowerCase()) ||
    (m.department || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Team</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "32px", letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "8px" }}>Address Book</h1>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "var(--text-muted)" }}>Save team members for fast payroll runs. Addresses never leave your browser.</p>
        </div>
        <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); setForm({ label: "", address: "", department: "" }); }} style={{
          display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px",
          borderRadius: "8px", cursor: "pointer", border: "none",
          background: "var(--cyan)", color: "#050810",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "13px"
        }}>
          <Plus size={14} /> Add Member
        </button>
      </div>

      {/* Add/Edit form */}
      {showAdd && (
        <div style={{ padding: "24px", borderRadius: "12px", background: "var(--bg-card)", border: "1px solid var(--border-accent)", marginBottom: "24px" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px", color: "var(--text)", marginBottom: "20px" }}>
            {editingId ? "Edit Member" : "Add Team Member"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 200px", gap: "12px", marginBottom: "16px" }}>
            {[
              { label: "NAME / LABEL", field: "label", placeholder: "Alice Chen" },
              { label: "WALLET ADDRESS", field: "address", placeholder: "Solana address..." },
            ].map(f => (
              <div key={f.field}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px", letterSpacing: "0.05em" }}>{f.label}</p>
                <input value={(form as any)[f.field]} onChange={e => setForm(p => ({ ...p, [f.field]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", boxSizing: "border-box", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: f.field === "address" ? "var(--font-mono)" : "var(--font-display)", fontSize: "13px", outline: "none" }} />
              </div>
            ))}
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px", letterSpacing: "0.05em" }}>DEPARTMENT</p>
              <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", boxSizing: "border-box", background: "var(--bg-card-hover)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-display)", fontSize: "13px", outline: "none" }}>
                <option value="">Select...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={save} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", background: "var(--cyan)", border: "none", color: "#050810", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "13px" }}>
              <Check size={13} /> {editingId ? "Update" : "Save Member"}
            </button>
            <button onClick={() => { setShowAdd(false); setEditingId(null); }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: "13px" }}>
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {members.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, address, department..."
            style={{ width: "100%", maxWidth: "400px", padding: "10px 14px", borderRadius: "8px", boxSizing: "border-box", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-display)", fontSize: "13px", outline: "none" }} />
        </div>
      )}

      {/* Members list */}
      {filtered.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "16px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={24} color="var(--text-muted)" />
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "15px", color: "var(--text-muted)" }}>
            {members.length === 0 ? "No team members yet" : "No results found"}
          </p>
          {members.length === 0 && (
            <p style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "var(--text-muted)" }}>Add your first team member to speed up payroll runs</p>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {filtered.map(m => (
            <div key={m.id} style={{ padding: "18px 24px", borderRadius: "10px", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "20px", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-accent)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--cyan-dim)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", color: "var(--cyan)" }}>{m.label.charAt(0).toUpperCase()}</p>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>{m.label}</p>
                  {m.department && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "var(--cyan-dim)", color: "var(--cyan)", border: "1px solid var(--border-accent)" }}>{m.department}</span>
                  )}
                </div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.address}</p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button onClick={() => copyAddr(m.address)} title="Copy address" style={{ width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", background: "var(--bg-card-hover)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: copied === m.address ? "var(--green)" : "var(--text-muted)" }}>
                  {copied === m.address ? <CheckCircle size={13} /> : <Copy size={13} />}
                </button>
                <button onClick={() => startEdit(m)} title="Edit" style={{ width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", background: "var(--bg-card-hover)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  <Edit2 size={13} />
                </button>
                <button onClick={() => remove(m.id)} title="Remove" style={{ width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", background: "var(--bg-card-hover)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}