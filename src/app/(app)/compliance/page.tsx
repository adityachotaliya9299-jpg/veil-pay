"use client";
import { useState } from "react";
import { Eye, Key, Download, Copy, CheckCircle, Loader2, Lock, Calendar, Shield } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ClientOnly } from "@/components/ClientOnly";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUmbraClient } from "@/hooks/useUmbraClient";

type ViewingKeyExport = {
  scope: string;
  key: string;
  exportedAt: string;
};

export default function CompliancePage() {
  const { connected } = useWallet();
  const { client } = useUmbraClient();

  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [day, setDay] = useState(new Date().getDate().toString());
  const [scope, setScope] = useState<"yearly" | "monthly" | "daily">("monthly");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportedKeys, setExportedKeys] = useState<ViewingKeyExport[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateViewingKey = async () => {
    if (!client) return;
    setIsGenerating(true);
    setError(null);

    try {
      let keyBytes: Uint8Array;
      let scopeLabel: string;
      const y = parseInt(year);
      const m = parseInt(month);
      const d = parseInt(day);

      if (scope === "yearly") {
        keyBytes = await (client as any).yearlyViewingKey?.generate(y)
          ?? await (client as any).masterViewingKey?.derive({ year: y });
        scopeLabel = `Yearly ${y}`;
      } else if (scope === "monthly") {
        keyBytes = await (client as any).monthlyViewingKey?.generate(y, m)
          ?? await (client as any).masterViewingKey?.derive({ year: y, month: m });
        scopeLabel = `Monthly ${y}-${String(m).padStart(2, "0")}`;
      } else {
        keyBytes = await (client as any).dailyViewingKey?.generate(y, m, d)
          ?? await (client as any).masterViewingKey?.derive({ year: y, month: m, day: d });
        scopeLabel = `Daily ${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      }

      const hex = Buffer.from(keyBytes).toString("hex");
      const entry: ViewingKeyExport = {
        scope: scopeLabel,
        key: hex,
        exportedAt: new Date().toLocaleString(),
      };

      setExportedKeys(prev => [entry, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate viewing key. Make sure your Umbra client is connected.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const exportCSV = () => {
    const rows = [["Scope", "Viewing Key (hex)", "Exported At"],
      ...exportedKeys.map(k => [k.scope, k.key, k.exportedAt])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "veilpay-viewing-keys.csv"; a.click();
  };

  if (!connected) {
    return (
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:"24px" }}>
        <Lock size={28} color="var(--cyan)" />
        <div style={{ textAlign:"center" }}>
          <h2 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"24px",color:"var(--text)",marginBottom:"8px" }}>Connect wallet</h2>
          <p style={{ fontFamily:"var(--font-display)",fontSize:"14px",color:"var(--text-muted)" }}>Compliance tools require a connected wallet</p>
        </div>
        <ClientOnly><WalletMultiButton /></ClientOnly>
      </div>
    );
  }

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:"40px" }}>
        <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--cyan)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Compliance</p>
        <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"32px",letterSpacing:"-0.03em",color:"var(--text)",marginBottom:"8px" }}>Compliance Dashboard</h1>
        <p style={{ fontFamily:"var(--font-display)",fontSize:"14px",color:"var(--text-muted)" }}>
          Generate scoped viewing keys derived from your master key. Share with auditors to prove transaction history — without exposing anything outside that scope.
        </p>
      </div>

      {/* Key hierarchy explainer */}
      <div style={{ padding:"20px 24px",borderRadius:"10px",background:"var(--bg-card)",border:"1px solid var(--border)",marginBottom:"32px",display:"flex",gap:"32px",flexWrap:"wrap" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
          <Shield size={14} color="var(--cyan)" />
          <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)" }}>Master Viewing Key</p>
          <span style={{ color:"var(--text-muted)" }}>→</span>
          <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--cyan)" }}>Yearly Key</p>
          <span style={{ color:"var(--text-muted)" }}>→</span>
          <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--cyan)" }}>Monthly Key</p>
          <span style={{ color:"var(--text-muted)" }}>→</span>
          <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--cyan)" }}>Daily Key</p>
        </div>
        <p style={{ fontFamily:"var(--font-display)",fontSize:"12px",color:"var(--text-muted)" }}>
          Each level grants read-only access only within its time scope. Poseidon-derived, non-reversible.
        </p>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",marginBottom:"32px" }}>
        {/* Generator */}
        <div style={{ padding:"28px",borderRadius:"12px",background:"var(--bg-card)",border:"1px solid var(--border)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px" }}>
            <div style={{ width:"36px",height:"36px",borderRadius:"8px",background:"var(--cyan-dim)",border:"1px solid var(--border-accent)",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Key size={16} color="var(--cyan)" />
            </div>
            <div>
              <p style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"15px",color:"var(--text)" }}>Generate Viewing Key</p>
              <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)" }}>Derive a scoped key to share</p>
            </div>
          </div>

          {/* Scope selector */}
          <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"10px" }}>Scope</p>
          <div style={{ display:"flex",gap:"8px",marginBottom:"20px" }}>
            {(["yearly","monthly","daily"] as const).map(s => (
              <button key={s} onClick={() => setScope(s)} style={{
                flex:1,padding:"8px",borderRadius:"6px",cursor:"pointer",
                background: scope === s ? "var(--cyan-dim)" : "transparent",
                border:`1px solid ${scope === s ? "var(--border-accent)" : "var(--border)"}`,
                color: scope === s ? "var(--cyan)" : "var(--text-muted)",
                fontFamily:"var(--font-display)",fontSize:"12px",fontWeight: scope === s ? 600 : 400,
                textTransform:"capitalize",transition:"all 0.15s"
              }}>{s}</button>
            ))}
          </div>

          {/* Date fields */}
          <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"10px" }}>Time Period</p>
          <div style={{ display:"grid",gridTemplateColumns: scope === "yearly" ? "1fr" : scope === "monthly" ? "1fr 1fr" : "1fr 1fr 1fr",gap:"10px",marginBottom:"20px" }}>
            <div>
              <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--text-muted)",marginBottom:"6px" }}>YEAR</p>
              <input value={year} onChange={e => setYear(e.target.value)} type="number" min="2020" max="2030"
                style={{ width:"100%",padding:"10px 12px",borderRadius:"8px",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",color:"var(--text)",fontFamily:"var(--font-mono)",fontSize:"13px",outline:"none" }} />
            </div>
            {(scope === "monthly" || scope === "daily") && (
              <div>
                <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--text-muted)",marginBottom:"6px" }}>MONTH</p>
                <select value={month} onChange={e => setMonth(e.target.value)}
                  style={{ width:"100%",padding:"10px 12px",borderRadius:"8px",boxSizing:"border-box",background:"var(--bg-card-hover)",border:"1px solid var(--border)",color:"var(--text)",fontFamily:"var(--font-mono)",fontSize:"13px",outline:"none" }}>
                  {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
            )}
            {scope === "daily" && (
              <div>
                <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--text-muted)",marginBottom:"6px" }}>DAY</p>
                <input value={day} onChange={e => setDay(e.target.value)} type="number" min="1" max="31"
                  style={{ width:"100%",padding:"10px 12px",borderRadius:"8px",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",color:"var(--text)",fontFamily:"var(--font-mono)",fontSize:"13px",outline:"none" }} />
              </div>
            )}
          </div>

          {error && (
            <div style={{ padding:"10px 14px",borderRadius:"8px",background:"var(--red-dim)",border:"1px solid rgba(255,77,106,0.3)",marginBottom:"16px" }}>
              <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--red)" }}>{error}</p>
            </div>
          )}

          <button onClick={generateViewingKey} disabled={isGenerating || !client} style={{
            width:"100%",padding:"13px",borderRadius:"8px",cursor: !client ? "not-allowed" : "pointer",
            background: !client ? "var(--bg-card-hover)" : "var(--cyan)",border:"none",
            color: !client ? "var(--text-muted)" : "#050810",
            fontFamily:"var(--font-display)",fontWeight:700,fontSize:"14px",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
            boxShadow: client ? "0 0 20px rgba(0,212,255,0.2)" : "none",transition:"all 0.2s"
          }}>
            {isGenerating
              ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} />Deriving...</>
              : <><Calendar size={14} />Generate {scope.charAt(0).toUpperCase() + scope.slice(1)} Key</>
            }
          </button>

          {!client && (
            <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)",textAlign:"center",marginTop:"8px" }}>
              Umbra client required
            </p>
          )}
        </div>

        {/* How to use */}
        <div style={{ padding:"28px",borderRadius:"12px",background:"var(--bg-card)",border:"1px solid var(--border)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px" }}>
            <div style={{ width:"36px",height:"36px",borderRadius:"8px",background:"var(--cyan-dim)",border:"1px solid var(--border-accent)",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Eye size={16} color="var(--cyan)" />
            </div>
            <div>
              <p style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"15px",color:"var(--text)" }}>How Viewing Keys Work</p>
              <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)" }}>Selective disclosure for auditors</p>
            </div>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:"16px" }}>
            {[
              { step:"1", title:"Generate a scoped key", desc:"Pick a time scope (yearly/monthly/daily). Your master viewing key derives a child key for that period only." },
              { step:"2", title:"Share with auditor", desc:"Copy the hex key and send it securely to your accountant, regulator, or legal team." },
              { step:"3", title:"Auditor scans UTXOs", desc:"They use the key to decrypt only UTXOs within that scope. Nothing outside that period is visible." },
              { step:"4", title:"Revoke anytime", desc:"Generate a new master seed rotation to invalidate previously shared keys." },
            ].map(s => (
              <div key={s.step} style={{ display:"flex",gap:"14px",alignItems:"flex-start" }}>
                <div style={{ width:"24px",height:"24px",borderRadius:"50%",background:"var(--cyan-dim)",border:"1px solid var(--border-accent)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--cyan)",fontWeight:700 }}>{s.step}</p>
                </div>
                <div>
                  <p style={{ fontFamily:"var(--font-display)",fontWeight:600,fontSize:"13px",color:"var(--text)",marginBottom:"3px" }}>{s.title}</p>
                  <p style={{ fontFamily:"var(--font-display)",fontSize:"12px",color:"var(--text-muted)",lineHeight:1.5 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exported keys */}
      {exportedKeys.length > 0 && (
        <div style={{ padding:"24px",borderRadius:"12px",background:"var(--bg-card)",border:"1px solid var(--border)" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px" }}>
            <div>
              <p style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"15px",color:"var(--text)",marginBottom:"4px" }}>Exported Viewing Keys</p>
              <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)" }}>{exportedKeys.length} key{exportedKeys.length !== 1 ? "s" : ""} generated this session</p>
            </div>
            <button onClick={exportCSV} style={{
              display:"flex",alignItems:"center",gap:"8px",padding:"10px 18px",borderRadius:"8px",cursor:"pointer",
              background:"var(--cyan-dim)",border:"1px solid var(--border-accent)",
              color:"var(--cyan)",fontFamily:"var(--font-display)",fontWeight:600,fontSize:"13px"
            }}>
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
            {exportedKeys.map((k, i) => (
              <div key={i} style={{ padding:"16px 20px",borderRadius:"10px",background:"var(--bg-card-hover)",border:"1px solid var(--border)",display:"flex",alignItems:"center",gap:"16px" }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"6px" }}>
                    <p style={{ fontFamily:"var(--font-display)",fontWeight:600,fontSize:"13px",color:"var(--text)" }}>{k.scope}</p>
                    <span style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--text-muted)" }}>{k.exportedAt}</span>
                  </div>
                  <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                    {k.key.slice(0, 48)}...{k.key.slice(-8)}
                  </p>
                </div>
                <button onClick={() => copyKey(k.key)} style={{
                  display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"6px",cursor:"pointer",flexShrink:0,
                  background: copiedKey === k.key ? "var(--green-dim)" : "var(--bg-card)",
                  border:`1px solid ${copiedKey === k.key ? "rgba(0,229,160,0.3)" : "var(--border)"}`,
                  color: copiedKey === k.key ? "var(--green)" : "var(--text-muted)",
                  fontFamily:"var(--font-display)",fontSize:"12px",transition:"all 0.2s"
                }}>
                  {copiedKey === k.key ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy Key</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}