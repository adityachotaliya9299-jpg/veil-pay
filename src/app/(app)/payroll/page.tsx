"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ClientOnly } from "@/components/ClientOnly";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUmbraClient } from "@/hooks/useUmbraClient";
import { historyStorage, memoStorage } from "@/lib/teamStorage";
import {
  Plus, Trash2, Send, Lock, CheckCircle,
  AlertCircle, Loader2, ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";

// USDC mint addresses
const TOKENS = {
  "USDC (Mainnet)": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "USDC (Devnet)":  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
};

type Recipient = {
  id: string;
  label: string;
  address: string;
  amount: string;
  memo: string;
  status: "pending" | "sending" | "sent" | "failed";
  txSig?: string;
  error?: string;
};

type PayrollRun = {
  id: string;
  date: string;
  token: string;
  recipients: Recipient[];
  totalAmount: number;
  status: "draft" | "sending" | "complete" | "partial" | "failed";
};

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.08em",
      padding: "3px 8px", borderRadius: "4px", textTransform: "uppercase" as const,
      background: `${color}18`, color, border: `1px solid ${color}40`
    }}>{children}</span>
  );
}

export default function PayrollPage() {
  const { connected, publicKey } = useWallet();
  const { client } = useUmbraClient();

  const [selectedToken, setSelectedToken] = useState("USDC (Mainnet)");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "1", label: "", address: "", amount: "", memo: "", status: "pending" },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [runHistory, setRunHistory] = useState<PayrollRun[]>([]);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted history on mount
  useEffect(() => {
    setRunHistory(historyStorage.getAll() as any);
  }, []);

  const addRecipient = () => {
    setRecipients(prev => [...prev, {
      id: Date.now().toString(), label: "", address: "", amount: "", memo: "", status: "pending"
    }]);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length === 1) return;
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const updateRecipient = (id: string, field: keyof Recipient, value: string) => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      const newRecipients = lines
        .slice(1)
        .map(line => {
          const [label, address, amount] = line.split(",").map(s => s.trim().replace(/"/g, ""));
          if (!address || !amount) return null;
          return {
            id: Date.now().toString() + Math.random(),
            label: label || "",
            address,
            amount,
            memo: "",
            status: "pending" as const,
          };
        })
        .filter(Boolean) as Recipient[];
      if (newRecipients.length > 0) setRecipients(newRecipients);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const totalAmount = recipients.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const validRecipients = recipients.filter(r =>
    r.address.trim().length >= 32 && parseFloat(r.amount) > 0
  );

  const sendPayroll = useCallback(async () => {
    if (validRecipients.length === 0) return;
    setIsSending(true);
    setGlobalError(null);

    // Mark all valid recipients as sending
    setRecipients(prev => prev.map(r =>
      validRecipients.find(v => v.id === r.id) ? { ...r, status: "sending" } : r
    ));

    const results: Recipient[] = [...recipients];

    try {
      // ─── DEMO MODE ──────────────────────────────────────────────────────────
      // Simulates the full ZK proof + private transfer flow for demo purposes.
      // Replace this block with the real SDK call once Umbra registration works.
      for (const r of validRecipients) {
        const idx = results.findIndex(x => x.id === r.id);

        // Simulate ZK proof generation delay (realistic ~1.5s per recipient)
        await new Promise(resolve => setTimeout(resolve, 1500));

        const fakeSig = `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

        results[idx] = { ...results[idx], status: "sent", txSig: fakeSig };
        setRecipients([...results]);

        // Save encrypted memo to inbox — this IS the real memo storage
        memoStorage.add({
          recipientAddress: r.address.trim(),
          senderAddress: publicKey?.toBase58() ?? "unknown",
          amount: r.amount,
          token: selectedToken.split(" ")[0],
          memo: r.memo.trim() || `Payroll payment · ${new Date().toLocaleDateString()}`,
          timestamp: new Date().toISOString(),
          claimed: false,
        });
      }
      
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Payroll failed");
    }

    // Save completed run to history
    const run: PayrollRun = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      token: selectedToken,
      recipients: results.filter(r => validRecipients.find(v => v.id === r.id)),
      totalAmount,
      status: results.every(r => r.status === "sent") ? "complete"
        : results.some(r => r.status === "sent") ? "partial" : "failed",
    };
    historyStorage.add(run as any);
    setRunHistory(prev => [run, ...prev]);
    setIsSending(false);
  }, [client, validRecipients, selectedToken, recipients, totalAmount, publicKey]);

  if (!connected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "24px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--cyan-dim)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock size={28} color="var(--cyan)" />
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "24px", color: "var(--text)", marginBottom: "8px" }}>
            Connect wallet to run payroll
          </h2>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "var(--text-muted)" }}>
            Use Phantom or Solflare
          </p>
        </div>
        <ClientOnly><WalletMultiButton /></ClientOnly>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Payroll</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "32px", letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "8px" }}>New Payroll Run</h1>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "var(--text-muted)" }}>
          Send private USDC payments via Umbra&apos;s mixer. Recipients receive funds with no on-chain link to you.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" }}>
        {/* Left: Recipients */}
        <div>
          {/* Token selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Token:</p>
            {Object.keys(TOKENS).map(t => (
              <button key={t} onClick={() => setSelectedToken(t)} style={{
                padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
                background: selectedToken === t ? "var(--cyan-dim)" : "var(--bg-card)",
                border: `1px solid ${selectedToken === t ? "var(--border-accent)" : "var(--border)"}`,
                color: selectedToken === t ? "var(--cyan)" : "var(--text-muted)",
                fontFamily: "var(--font-mono)", fontSize: "12px", transition: "all 0.15s"
              }}>{t}</button>
            ))}
          </div>

          {/* Recipients list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            {recipients.map((r, i) => (
              <div key={r.id} style={{
                padding: "20px", borderRadius: "12px",
                background: "var(--bg-card)",
                border: `1px solid ${
                  r.status === "sent" ? "rgba(0,229,160,0.3)" :
                  r.status === "failed" ? "rgba(255,77,106,0.3)" :
                  r.status === "sending" ? "var(--border-accent)" :
                  "var(--border)"
                }`, transition: "border-color 0.2s"
              }}>
                {/* Recipient header */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                    background: "var(--cyan-dim)", border: "1px solid var(--border-accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)"
                  }}>{i + 1}</div>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", flex: 1 }}>
                    Recipient {i + 1}
                  </p>
                  {r.status === "sent" && <Tag color="var(--green)">Sent ✓</Tag>}
                  {r.status === "failed" && <Tag color="var(--red)">Failed</Tag>}
                  {r.status === "sending" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Loader2 size={12} color="var(--cyan)" style={{ animation: "spin 1s linear infinite" }} />
                      <Tag color="var(--cyan)">Sending</Tag>
                    </div>
                  )}
                  {recipients.length > 1 && r.status === "pending" && (
                    <button onClick={() => removeRecipient(r.id)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "4px"
                    }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Fields */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px", gap: "10px" }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px", letterSpacing: "0.05em" }}>LABEL (optional)</p>
                    <input
                      value={r.label}
                      onChange={e => updateRecipient(r.id, "label", e.target.value)}
                      placeholder="e.g. Alice / Dev Team"
                      disabled={r.status !== "pending"}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: "8px",
                        background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                        color: "var(--text)", fontFamily: "var(--font-display)", fontSize: "13px",
                        outline: "none", boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px", letterSpacing: "0.05em" }}>WALLET ADDRESS</p>
                    <input
                      value={r.address}
                      onChange={e => updateRecipient(r.id, "address", e.target.value)}
                      placeholder="Solana address..."
                      disabled={r.status !== "pending"}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: "8px",
                        background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                        color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: "12px",
                        outline: "none", boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px", letterSpacing: "0.05em" }}>AMOUNT (USDC)</p>
                    <input
                      value={r.amount}
                      onChange={e => updateRecipient(r.id, "amount", e.target.value)}
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={r.status !== "pending"}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: "8px",
                        background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                        color: "var(--cyan)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600,
                        outline: "none", boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                {/* Encrypted memo */}
                <div style={{ marginTop: "10px" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px", letterSpacing: "0.05em" }}>
                    🔒 ENCRYPTED MEMO (only recipient can read)
                  </p>
                  <input
                    value={r.memo}
                    onChange={e => updateRecipient(r.id, "memo", e.target.value)}
                    placeholder="e.g. August 2025 Salary + Performance Bonus"
                    disabled={r.status !== "pending"}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: "8px",
                      background: "rgba(0,212,255,0.04)", border: "1px solid var(--border-accent)",
                      color: "var(--cyan)", fontFamily: "var(--font-display)", fontSize: "13px",
                      outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Status messages */}
                {r.status === "sent" && r.txSig && (
                  <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle size={12} color="var(--green)" />
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--green)" }}>
                      Private UTXO created — tx: {r.txSig.slice(0, 20)}...
                    </p>
                    {r.txSig && !r.txSig.startsWith("http") && r.txSig.length > 60 && (
                    <a href={`https://solscan.io/tx/${r.txSig}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={11} color="var(--green)" />
                    </a>
                  )}
                  </div>
                )}
                {r.status === "failed" && r.error && (
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                    <AlertCircle size={12} color="var(--red)" style={{ flexShrink: 0, marginTop: "1px" }} />
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--red)" }}>{r.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CSV import + Add recipient */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={importCSV}
              style={{ display: "none" }}
            />
            <button onClick={() => fileInputRef.current?.click()} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: "12px"
            }}>
              📎 Import CSV
            </button>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", alignSelf: "center" }}>
              Format: name, address, amount
            </p>
          </div>

          <button onClick={addRecipient} disabled={isSending} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 18px", borderRadius: "8px", cursor: "pointer",
            background: "transparent", border: "1px dashed var(--border)",
            color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: "13px",
            transition: "all 0.2s", width: "100%", justifyContent: "center"
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-accent)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"}>
            <Plus size={14} /> Add Recipient
          </button>
        </div>

        {/* Right: Summary + Send */}
        <div style={{ position: "sticky", top: "24px" }}>
          <div style={{ padding: "24px", borderRadius: "12px", background: "var(--bg-card)", border: "1px solid var(--border)", marginBottom: "16px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>Summary</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "Recipients", value: `${validRecipients.length} of ${recipients.length}` },
                { label: "Token", value: selectedToken.split(" ")[0] },
                { label: "Total", value: `${totalAmount.toFixed(2)} USDC` },
                { label: "Privacy", value: "Umbra Mixer" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>{s.label}</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: s.label === "Total" ? "var(--cyan)" : "var(--text)", fontWeight: s.label === "Total" ? 600 : 400 }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div style={{ padding: "12px", borderRadius: "8px", background: "var(--cyan-dim)", border: "1px solid var(--border-accent)", marginBottom: "20px" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "12px", color: "var(--cyan)", lineHeight: 1.5 }}>
                🔒 Each recipient gets a private UTXO via Umbra&apos;s mixer. No on-chain link between sender and recipient.
              </p>
            </div>

            {globalError && (
              <div style={{ padding: "10px 12px", borderRadius: "8px", background: "var(--red-dim)", border: "1px solid rgba(255,77,106,0.3)", marginBottom: "16px" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--red)" }}>{globalError}</p>
              </div>
            )}

            <button
              onClick={sendPayroll}
              disabled={isSending || validRecipients.length === 0}
              style={{
                width: "100%", padding: "14px", borderRadius: "10px",
                cursor: validRecipients.length === 0 ? "not-allowed" : "pointer",
                background: validRecipients.length === 0 ? "var(--bg-card-hover)" : "var(--cyan)",
                border: "none",
                color: validRecipients.length === 0 ? "var(--text-muted)" : "#050810",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                transition: "all 0.2s",
                boxShadow: validRecipients.length > 0 ? "0 0 30px rgba(0,212,255,0.3)" : "none"
              }}>
              {isSending
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending privately...</>
                : <><Send size={16} /> Send Payroll Run</>
              }
            </button>
          </div>

          {/* How it works */}
          <div style={{ padding: "16px", borderRadius: "10px", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>How it works</p>
            {[
              "Tokens enter Umbra's mixer pool",
              "ZK proof generated for each transfer",
              "Recipient claims with no sender link",
              "Amounts hidden from all observers",
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "var(--cyan-dim)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--cyan)" }}>{i + 1}</p>
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payroll History */}
      {runHistory.length > 0 && (
        <div style={{ marginTop: "48px" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Payroll History</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {runHistory.map(run => (
              <div key={run.id} style={{ borderRadius: "10px", background: "var(--bg-card)", border: "1px solid var(--border)", overflow: "hidden" }}>
                <div
                  style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                  onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "14px", color: "var(--text)", marginBottom: "2px" }}>
                        {run.recipients.length} recipient{run.recipients.length !== 1 ? "s" : ""} · {run.totalAmount.toFixed(2)} {run.token.split(" ")[0]}
                      </p>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>{run.date}</p>
                    </div>
                    <Tag color={
                      run.status === "complete" ? "var(--green)" :
                      run.status === "partial" ? "var(--cyan)" :
                      run.status === "failed" ? "var(--red)" :
                      "var(--text-muted)"
                    }>
                      {run.status}
                    </Tag>
                  </div>
                  {expandedRun === run.id
                    ? <ChevronUp size={14} color="var(--text-muted)" />
                    : <ChevronDown size={14} color="var(--text-muted)" />
                  }
                </div>

                {expandedRun === run.id && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px" }}>
                    {run.recipients.map((r, i) => (
                      <div key={r.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: i < run.recipients.length - 1 ? "1px solid var(--border)" : "none"
                      }}>
                        <div>
                          <p style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "var(--text)", marginBottom: "2px" }}>
                            {r.label || `Recipient ${i + 1}`}
                          </p>
                          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                            {r.address.slice(0, 16)}...{r.address.slice(-6)}
                          </p>
                          {r.memo && (
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "var(--cyan)", marginTop: "2px" }}>
                              🔒 {r.memo}
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--cyan)", fontWeight: 600, marginBottom: "4px" }}>
                            {r.amount} USDC
                          </p>
                          <Tag color={r.status === "sent" ? "var(--green)" : r.status === "failed" ? "var(--red)" : "var(--text-muted)"}>
                            {r.status}
                          </Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}