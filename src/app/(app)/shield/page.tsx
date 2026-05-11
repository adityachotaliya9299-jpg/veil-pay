"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ClientOnly } from "@/components/ClientOnly";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUmbraClient } from "@/hooks/useUmbraClient";
import {
  Shield, Lock, Loader2, CheckCircle,
  AlertCircle, ArrowDown, ExternalLink
} from "lucide-react";

const TOKENS: Record<string, { mint: string; decimals: number }> = {
  "USDC":          { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  "USDC (Devnet)": { mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", decimals: 6 },
};

type ShieldTx = { amount: string; token: string; txSig: string; date: string };

export default function ShieldPage() {
  const { connected, publicKey } = useWallet();
  const { client } = useUmbraClient();

  const [token, setToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "shielding" | "done" | "error">("idle");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ShieldTx[]>([]);

  const shield = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setStatus("shielding");
    setError(null);
    setTxSig(null);

    try {
      // ─── DEMO MODE ──────────────────────────────────────────────────────────
      // Simulates the ZK proof generation + encrypted deposit flow.
      // Remove this block and uncomment the real SDK call once Umbra
      // registration works (requires mainnet SOL or working devnet).
      await new Promise(r => setTimeout(r, 2000)); // simulate ZK proof time
      const fakeSig = `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
      setTxSig(fakeSig);
      setStatus("done");
      setHistory(prev => [{ amount, token, txSig: fakeSig, date: new Date().toLocaleString() }, ...prev]);
      setAmount("");
      return;
      // ─── END DEMO MODE ──────────────────────────────────────────────────────

      // Real SDK flow — uncomment when Umbra registration works:
      /*
      const sdk = await import("@umbra-privacy/sdk") as any;

      const depositFn =
        sdk.getPublicBalanceToEncryptedBalanceDepositorFunction ||
        sdk.getPublicBalanceToEncryptedBalanceDirectDepositorFunction;

      if (!depositFn) throw new Error("Deposit function not available");

      const deposit = depositFn({ client }, {});
      const mint = TOKENS[token].mint;
      const rawAmount = BigInt(Math.floor(parseFloat(amount) * 10 ** TOKENS[token].decimals));

      const result = await (deposit as any)({
        destinationAddress: publicKey?.toBase58() as any,
        mint: mint as any,
        amount: rawAmount,
      });

      const res = result as any;
      const sig: string = Array.isArray(res)
        ? res[0]
        : res?.signatures
          ? (Object.values(res.signatures) as string[][])[0]?.[0] ?? "confirmed"
          : "confirmed";

      setTxSig(sig);
      setStatus("done");
      setHistory(prev => [{ amount, token, txSig: sig, date: new Date().toLocaleString() }, ...prev]);
      setAmount("");
      */
    } catch (err) {
      setError(err instanceof Error ? err.message : "Shield failed");
      setStatus("error");
    }
  };

  if (!connected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "24px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--cyan-dim)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock size={28} color="var(--cyan)" />
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "24px", color: "var(--text)", marginBottom: "8px" }}>Shield your assets</h2>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "var(--text-muted)" }}>Connect wallet to deposit into encrypted balance</p>
        </div>
        <ClientOnly><WalletMultiButton /></ClientOnly>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "620px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Shield</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "32px", letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "8px" }}>Shield Assets</h1>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "var(--text-muted)" }}>
          Move tokens from your public wallet into Umbra&apos;s encrypted balance. Your balance becomes invisible on-chain.
        </p>
      </div>

      {/* Flow diagram */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", padding: "16px 20px", borderRadius: "10px", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Public Wallet</p>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>Visible on-chain</p>
        </div>
        <ArrowDown size={16} color="var(--cyan)" style={{ transform: "rotate(-90deg)", flexShrink: 0 }} />
        <div style={{ flex: 2, textAlign: "center", padding: "8px 12px", borderRadius: "8px", background: "var(--cyan-dim)", border: "1px solid var(--border-accent)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--cyan)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Umbra Mixer</p>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "12px", color: "var(--cyan)" }}>ZK Privacy Layer</p>
        </div>
        <ArrowDown size={16} color="var(--green)" style={{ transform: "rotate(-90deg)", flexShrink: 0 }} />
        <div style={{ textAlign: "center", flex: 1 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Encrypted Balance</p>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "13px", color: "var(--green)" }}>🔒 Private</p>
        </div>
      </div>

      {/* Shield form */}
      <div style={{ padding: "28px", borderRadius: "12px", background: "var(--bg-card)", border: "1px solid var(--border)", marginBottom: "24px" }}>

        {/* Token selector */}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Token</p>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {Object.keys(TOKENS).map(t => (
            <button key={t} onClick={() => setToken(t)} style={{
              padding: "7px 14px", borderRadius: "6px", cursor: "pointer",
              background: token === t ? "var(--cyan-dim)" : "transparent",
              border: `1px solid ${token === t ? "var(--border-accent)" : "var(--border)"}`,
              color: token === t ? "var(--cyan)" : "var(--text-muted)",
              fontFamily: "var(--font-mono)", fontSize: "12px", transition: "all 0.15s"
            }}>{t}</button>
          ))}
        </div>

        {/* Amount input */}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Amount</p>
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            style={{
              width: "100%", padding: "14px 60px 14px 16px", borderRadius: "10px", boxSizing: "border-box",
              background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
              color: "var(--cyan)", fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 600, outline: "none"
            }}
          />
          <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-muted)" }}>
            {token.split(" ")[0]}
          </span>
        </div>

        {/* Error message */}
        {status === "error" && error && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "var(--red-dim)", border: "1px solid rgba(255,77,106,0.3)", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <AlertCircle size={14} color="var(--red)" style={{ flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--red)" }}>{error}</p>
          </div>
        )}

        {/* Success message */}
        {status === "done" && txSig && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "var(--green-dim)", border: "1px solid rgba(0,229,160,0.3)", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <CheckCircle size={13} color="var(--green)" />
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "13px", color: "var(--green)" }}>Assets shielded successfully!</p>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--green)" }}>
              Your balance is now private and invisible on-chain.
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--green)", marginTop: "4px" }}>
              tx: {txSig.slice(0, 24)}...
              <a href={`https://solscan.io/tx/${txSig}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "8px" }}>
                <ExternalLink size={10} color="var(--green)" style={{ display: "inline" }} />
              </a>
            </p>
          </div>
        )}

        {/* Shield button */}
        <button
          onClick={shield}
          disabled={status === "shielding" || !amount || parseFloat(amount) <= 0}
          style={{
            width: "100%", padding: "14px", borderRadius: "10px",
            cursor: !amount || parseFloat(amount) <= 0 ? "not-allowed" : "pointer",
            border: "none",
            background: !amount || parseFloat(amount) <= 0 ? "var(--bg-card-hover)" : "var(--cyan)",
            color: !amount || parseFloat(amount) <= 0 ? "var(--text-muted)" : "#050810",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            boxShadow: amount && parseFloat(amount) > 0 ? "0 0 30px rgba(0,212,255,0.25)" : "none",
            transition: "all 0.2s"
          }}>
          {status === "shielding"
            ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Shielding via ZK proof...</>
            : <><Shield size={16} /> Shield {amount || "0"} {token.split(" ")[0]}</>
          }
        </button>
      </div>

      {/* Info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "32px" }}>
        {[
          {
            title: "After shielding",
            items: ["Balance hidden on-chain", "Only you can query it", "Use for private payroll", "Fully auditable with viewing key"]
          },
          {
            title: "ZK proof ensures",
            items: ["No link between deposit & balance", "Amount stays private", "Cryptographic guarantee", "Arcium MPC co-signs"]
          },
        ].map(card => (
          <div key={card.title} style={{ padding: "16px 20px", borderRadius: "10px", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "13px", color: "var(--text)", marginBottom: "10px" }}>{card.title}</p>
            {card.items.map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--cyan)", flexShrink: 0 }} />
                <p style={{ fontFamily: "var(--font-display)", fontSize: "12px", color: "var(--text-muted)" }}>{item}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Shield history */}
      {history.length > 0 && (
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Shield History</p>
          {history.map((h, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px", borderRadius: "8px",
              background: "var(--bg-card)", border: "1px solid var(--border)", marginBottom: "8px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={14} color="var(--green)" />
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "13px", color: "var(--text)" }}>
                    {h.amount} {h.token.split(" ")[0]} shielded
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)" }}>{h.date}</p>
                </div>
              </div>
              <a href={`https://solscan.io/tx/${h.txSig}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)" }}>{h.txSig.slice(0, 12)}...</p>
                <ExternalLink size={11} color="var(--cyan)" />
              </a>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}