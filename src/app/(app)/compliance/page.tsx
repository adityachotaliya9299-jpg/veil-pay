"use client";
import { useState } from "react";
import { Eye, Key, FileText, Download, CheckCircle, AlertCircle, Loader2, Lock } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ClientOnly } from "@/components/ClientOnly";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUmbraClient } from "@/hooks/useUmbraClient";

type DecryptedTx = {
  signature: string;
  sender: string;
  recipient: string;
  amount: string;
  token: string;
  timestamp: string;
  type: "send" | "receive";
};

export default function CompliancePage() {
  const { connected } = useWallet();
  const { client } = useUmbraClient();

  const [viewingKey, setViewingKey] = useState("");
  const [txSig, setTxSig] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decrypted, setDecrypted] = useState<DecryptedTx | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportHistory, setExportHistory] = useState<DecryptedTx[]>([]);

  const decryptTransaction = async () => {
    if (!client || !viewingKey.trim() || !txSig.trim()) return;
    setIsDecrypting(true);
    setError(null);
    setDecrypted(null);

    try {
      const { getMixerPoolViewingKeyDecryptorFunction } =
        await import("@umbra-privacy/sdk");

      const decrypt = getMixerPoolViewingKeyDecryptorFunction({ client });
      const result = await (decrypt as any)(txSig.trim(), viewingKey.trim());

      const tx: DecryptedTx = {
        signature: txSig.trim(),
        sender:    result?.sender    ?? "Confidential",
        recipient: result?.recipient ?? "Confidential",
        amount:    result?.amount    ?? result?.decryptedAmount ?? "Confidential",
        token:     result?.mint      ?? "USDC",
        timestamp: new Date().toLocaleString(),
        type:      result?.type      ?? "send",
      };

      setDecrypted(tx);
      setExportHistory(prev => [tx, ...prev.filter(t => t.signature !== tx.signature)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decrypt — check your viewing key and transaction signature.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Signature", "Type", "Sender", "Recipient", "Amount", "Token", "Timestamp"],
      ...exportHistory.map(t => [t.signature, t.type, t.sender, t.recipient, t.amount, t.token, t.timestamp]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "veilpay-compliance-report.csv"; a.click();
  };

  if (!connected) {
    return (
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:"24px" }}>
        <Lock size={28} color="var(--cyan)" />
        <div style={{ textAlign:"center" }}>
          <h2 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"24px",color:"var(--text)",marginBottom:"8px" }}>Connect wallet to view compliance</h2>
        </div>
        <ClientOnly><WalletMultiButton /></ClientOnly>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:"40px" }}>
        <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--cyan)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Compliance</p>
        <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"32px",letterSpacing:"-0.03em",color:"var(--text)",marginBottom:"8px" }}>Compliance Dashboard</h1>
        <p style={{ fontFamily:"var(--font-display)",fontSize:"14px",color:"var(--text-muted)" }}>
          Decrypt private transactions using viewing keys. Share with auditors or regulators — without exposing your full history.
        </p>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",marginBottom:"32px" }}>
        {/* Decrypt form */}
        <div style={{ padding:"28px",borderRadius:"12px",background:"var(--bg-card)",border:"1px solid var(--border)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px" }}>
            <div style={{ width:"36px",height:"36px",borderRadius:"8px",background:"var(--cyan-dim)",border:"1px solid var(--border-accent)",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Key size={16} color="var(--cyan)" />
            </div>
            <div>
              <p style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"15px",color:"var(--text)" }}>Decrypt Transaction</p>
              <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)" }}>Input viewing key + tx signature</p>
            </div>
          </div>

          <div style={{ marginBottom:"16px" }}>
            <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"8px" }}>Transaction Signature</p>
            <input
              value={txSig}
              onChange={e => setTxSig(e.target.value)}
              placeholder="Paste transaction signature..."
              style={{
                width:"100%",padding:"12px 14px",borderRadius:"8px",boxSizing:"border-box",
                background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",
                color:"var(--text)",fontFamily:"var(--font-mono)",fontSize:"12px",outline:"none"
              }}
            />
          </div>

          <div style={{ marginBottom:"20px" }}>
            <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"8px" }}>Viewing Key</p>
            <textarea
              value={viewingKey}
              onChange={e => setViewingKey(e.target.value)}
              placeholder="Paste the viewing key for this transaction..."
              rows={3}
              style={{
                width:"100%",padding:"12px 14px",borderRadius:"8px",boxSizing:"border-box",
                background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",
                color:"var(--text)",fontFamily:"var(--font-mono)",fontSize:"12px",outline:"none",
                resize:"vertical"
              }}
            />
          </div>

          {error && (
            <div style={{ padding:"10px 14px",borderRadius:"8px",background:"var(--red-dim)",border:"1px solid rgba(255,77,106,0.3)",marginBottom:"16px",display:"flex",gap:"8px",alignItems:"flex-start" }}>
              <AlertCircle size={14} color="var(--red)" style={{ flexShrink:0,marginTop:"1px" }} />
              <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--red)" }}>{error}</p>
            </div>
          )}

          <button
            onClick={decryptTransaction}
            disabled={isDecrypting || !viewingKey.trim() || !txSig.trim() || !client}
            style={{
              width:"100%",padding:"13px",borderRadius:"8px",cursor:"pointer",
              background:"var(--cyan)",border:"none",
              color:"#050810",fontFamily:"var(--font-display)",fontWeight:700,fontSize:"14px",
              display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
              opacity: !viewingKey.trim() || !txSig.trim() || !client ? 0.5 : 1,
              transition:"all 0.2s"
            }}>
            {isDecrypting
              ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> Decrypting...</>
              : <><Eye size={14} /> Decrypt Transaction</>
            }
          </button>
        </div>

        {/* Result */}
        <div style={{ padding:"28px",borderRadius:"12px",background:"var(--bg-card)",border:`1px solid ${decrypted ? "rgba(0,229,160,0.3)" : "var(--border)"}`,transition:"border-color 0.3s" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px" }}>
            <div style={{ width:"36px",height:"36px",borderRadius:"8px",background: decrypted ? "var(--green-dim)" : "var(--bg-card-hover)",border:`1px solid ${decrypted ? "rgba(0,229,160,0.3)" : "var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <FileText size={16} color={decrypted ? "var(--green)" : "var(--text-muted)"} />
            </div>
            <div>
              <p style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"15px",color:"var(--text)" }}>Decrypted Details</p>
              <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)" }}>
                {decrypted ? "Transaction successfully decrypted" : "Awaiting decryption"}
              </p>
            </div>
          </div>

          {!decrypted ? (
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"160px",gap:"12px" }}>
              <div style={{ width:"48px",height:"48px",borderRadius:"50%",background:"var(--bg-card-hover)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Lock size={20} color="var(--text-muted)" />
              </div>
              <p style={{ fontFamily:"var(--font-display)",fontSize:"13px",color:"var(--text-muted)",textAlign:"center" }}>
                Enter a viewing key and transaction signature to reveal the private details
              </p>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:"12px" }}>
              {[
                { label:"Signature", value: `${decrypted.signature.slice(0,24)}...` },
                { label:"Type", value: decrypted.type.toUpperCase() },
                { label:"Sender", value: decrypted.sender.length > 20 ? `${decrypted.sender.slice(0,16)}...` : decrypted.sender },
                { label:"Recipient", value: decrypted.recipient.length > 20 ? `${decrypted.recipient.slice(0,16)}...` : decrypted.recipient },
                { label:"Amount", value: `${decrypted.amount} ${decrypted.token}` },
                { label:"Timestamp", value: decrypted.timestamp },
              ].map(f => (
                <div key={f.label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)" }}>
                  <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)" }}>{f.label}</p>
                  <p style={{ fontFamily:"var(--font-mono)",fontSize:"12px",color: f.label === "Amount" ? "var(--cyan)" : "var(--text)",fontWeight: f.label === "Amount" ? 600 : 400 }}>{f.value}</p>
                </div>
              ))}
              <div style={{ display:"flex",alignItems:"center",gap:"6px",paddingTop:"4px" }}>
                <CheckCircle size={12} color="var(--green)" />
                <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--green)" }}>Verified via Umbra viewing key</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail */}
      {exportHistory.length > 0 && (
        <div style={{ padding:"24px",borderRadius:"12px",background:"var(--bg-card)",border:"1px solid var(--border)" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px" }}>
            <div>
              <p style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"15px",color:"var(--text)",marginBottom:"4px" }}>Audit Trail</p>
              <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)" }}>{exportHistory.length} decrypted transaction{exportHistory.length !== 1 ? "s" : ""} this session</p>
            </div>
            <button onClick={exportCSV} style={{
              display:"flex",alignItems:"center",gap:"8px",
              padding:"10px 18px",borderRadius:"8px",cursor:"pointer",
              background:"var(--cyan-dim)",border:"1px solid var(--border-accent)",
              color:"var(--cyan)",fontFamily:"var(--font-display)",fontWeight:600,fontSize:"13px"
            }}>
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["Signature","Type","Sender","Recipient","Amount","Token","Time"].map(h => (
                    <th key={h} style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--text-muted)",textAlign:"left",padding:"8px 12px",letterSpacing:"0.08em",textTransform:"uppercase",borderBottom:"1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exportHistory.map(tx => (
                  <tr key={tx.signature}>
                    {[
                      `${tx.signature.slice(0,12)}...`,
                      tx.type,
                      tx.sender.length > 12 ? `${tx.sender.slice(0,12)}...` : tx.sender,
                      tx.recipient.length > 12 ? `${tx.recipient.slice(0,12)}...` : tx.recipient,
                      tx.amount,
                      tx.token,
                      tx.timestamp,
                    ].map((v, i) => (
                      <td key={i} style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color: i === 4 ? "var(--cyan)" : "var(--text)",padding:"10px 12px",borderBottom:"1px solid var(--border)" }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}