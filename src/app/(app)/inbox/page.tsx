"use client";
import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ClientOnly } from "@/components/ClientOnly";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUmbraClient } from "@/hooks/useUmbraClient";
import { memoStorage, type PayrollMemo } from "@/lib/teamStorage";
import {
  Inbox, Lock, Unlock, Loader2, CheckCircle,
  Clock, Copy, ExternalLink, Shield, Eye, EyeOff, RefreshCw
} from "lucide-react";

type ClaimableUtxo = {
  id: string;
  amount: string;
  token: string;
  status: "unclaimed" | "claiming" | "claimed" | "failed";
  txSig?: string;
  error?: string;
  raw?: unknown;
};

export default function InboxPage() {
  const { connected, publicKey } = useWallet();
  const { client } = useUmbraClient();

  const [memos, setMemos] = useState<PayrollMemo[]>([]);
  const [utxos, setUtxos] = useState<ClaimableUtxo[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [revealedMemos, setRevealedMemos] = useState<Set<string>>(new Set());
  const [copiedAddr, setCopiedAddr] = useState(false);

  const addr = publicKey?.toBase58() ?? "";
  const shortAddr = addr ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : "";

  // Load local memos
  useEffect(() => {
    if (addr) setMemos(memoStorage.getForAddress(addr));
  }, [addr]);

  // Fetch real UTXOs from Umbra
  const fetchUtxos = useCallback(async () => {
    if (!client || !addr) return;
    setIsFetching(true);
    setFetchError(null);
    try {
      const { getReceiverClaimableUtxoFetcherFunction } = await import("@umbra-privacy/sdk");
      const fetcher = getReceiverClaimableUtxoFetcherFunction({ client });
      const raw = await (fetcher as any)(addr as any);
      const list = (Array.isArray(raw) ? raw : []).map((u: any, i: number) => ({
        id: u.id ?? u.commitment ?? `utxo-${i}`,
        amount: u.amount ? (Number(u.amount) / 1_000_000).toFixed(2) : "?",
        token: u.mint ?? "USDC",
        status: "unclaimed" as const,
        raw: u,
      }));
      setUtxos(list);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Could not fetch inbox");
    } finally {
      setIsFetching(false);
    }
  }, [client, addr]);

  useEffect(() => { fetchUtxos(); }, [fetchUtxos]);

  const claimUtxo = async (utxo: ClaimableUtxo) => {
    if (!client) return;
    setClaimingId(utxo.id);
    setUtxos(prev => prev.map(u => u.id === utxo.id ? { ...u, status: "claiming" } : u));
    try {
      const { getReceiverClaimableUtxoClaimerFunction } = await import("@umbra-privacy/sdk");
      const { getClaimReceiverClaimableUtxoIntoEncryptedBalanceProver } =
        await import("@umbra-privacy/web-zk-prover");
      const zkProver = getClaimReceiverClaimableUtxoIntoEncryptedBalanceProver();
      const claimer = getReceiverClaimableUtxoClaimerFunction({ client }, { zkProver } as any);
      const sigs = await (claimer as any)(utxo.raw);
      const txSig = Array.isArray(sigs) ? sigs[0] : String(sigs);
      setUtxos(prev => prev.map(u => u.id === utxo.id ? { ...u, status: "claimed", txSig } : u));
      // Also mark any matching memo as claimed
      memos.filter(m => !m.claimed).forEach(m => memoStorage.markClaimed(m.id, txSig));
      setMemos(memoStorage.getForAddress(addr));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Claim failed";
      setUtxos(prev => prev.map(u => u.id === utxo.id ? { ...u, status: "failed", error: msg } : u));
    } finally {
      setClaimingId(null);
    }
  };

  const claimMemo = async (memo: PayrollMemo) => {
    // For memos without a real UTXO, mark as claimed locally
    memoStorage.markClaimed(memo.id, "local-claim-" + Date.now());
    setMemos(memoStorage.getForAddress(addr));
  };

  const toggleReveal = (id: string) => {
    setRevealedMemos(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const copyAddr = () => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const totalPending = memos.filter(m => !m.claimed).length + utxos.filter(u => u.status === "unclaimed").length;
  const totalReceived = memos.filter(m => m.claimed).length + utxos.filter(u => u.status === "claimed").length;

  if (!connected) {
    return (
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:"24px" }}>
        <div style={{ width:"64px",height:"64px",borderRadius:"16px",background:"var(--cyan-dim)",border:"1px solid var(--border-accent)",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Inbox size={28} color="var(--cyan)" />
        </div>
        <div style={{ textAlign:"center" }}>
          <h2 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"24px",color:"var(--text)",marginBottom:"8px" }}>Your Private Payroll Inbox</h2>
          <p style={{ fontFamily:"var(--font-display)",fontSize:"14px",color:"var(--text-muted)" }}>Connect wallet to view incoming private payments</p>
        </div>
        <ClientOnly><WalletMultiButton /></ClientOnly>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:"32px" }}>
        <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--cyan)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Stealth Inbox</p>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"16px" }}>
          <div>
            <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"32px",letterSpacing:"-0.03em",color:"var(--text)",marginBottom:"8px" }}>Private Payroll Inbox</h1>
            <p style={{ fontFamily:"var(--font-display)",fontSize:"14px",color:"var(--text-muted)" }}>
              Your salary arrives privately. No sender, no amount, no address — visible on-chain.
            </p>
          </div>
          <button onClick={fetchUtxos} disabled={isFetching} style={{
            display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",
            borderRadius:"8px",cursor:"pointer",
            background:"var(--bg-card)",border:"1px solid var(--border)",
            color:"var(--text-muted)",fontFamily:"var(--font-display)",fontSize:"13px"
          }}>
            <RefreshCw size={13} style={{ animation: isFetching ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Private address card */}
      <div style={{
        padding:"20px 24px",borderRadius:"12px",marginBottom:"32px",
        background:"linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(0,136,255,0.05) 100%)",
        border:"1px solid var(--border-accent)",
        display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"16px"
      }}>
        <div style={{ display:"flex",alignItems:"center",gap:"16px" }}>
          <div style={{ width:"44px",height:"44px",borderRadius:"50%",background:"var(--cyan-dim)",border:"1px solid var(--border-accent)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Shield size={20} color="var(--cyan)" />
          </div>
          <div>
            <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--cyan)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px" }}>Your Private Payroll Address</p>
            <p style={{ fontFamily:"var(--font-mono)",fontSize:"13px",color:"var(--text)" }}>{shortAddr}</p>
            <p style={{ fontFamily:"var(--font-display)",fontSize:"11px",color:"var(--text-muted)",marginTop:"2px" }}>
              Share this with employers. Incoming payments are invisible on-chain.
            </p>
          </div>
        </div>
        <div style={{ display:"flex",gap:"8px" }}>
          <button onClick={copyAddr} style={{
            display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",
            background: copiedAddr ? "var(--green-dim)" : "var(--cyan-dim)",
            border:`1px solid ${copiedAddr ? "rgba(0,229,160,0.3)" : "var(--border-accent)"}`,
            color: copiedAddr ? "var(--green)" : "var(--cyan)",
            fontFamily:"var(--font-display)",fontWeight:600,fontSize:"12px",transition:"all 0.2s"
          }}>
            {copiedAddr ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy Address</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"16px",marginBottom:"40px" }}>
        {[
          { label:"Pending Claims", value: totalPending.toString(), color:"var(--cyan)", sub: "Ready to claim" },
          { label:"Claimed", value: totalReceived.toString(), color:"var(--green)", sub: "Into encrypted balance" },
          { label:"Privacy", value:"100%", color:"var(--green)", sub: "On-chain unlinkable" },
          { label:"Memo Encryption", value:"Active", color:"var(--cyan)", sub: "Only you can read" },
        ].map(s => (
          <div key={s.label} style={{ padding:"20px",borderRadius:"10px",background:"var(--bg-card)",border:"1px solid var(--border)" }}>
            <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--text-muted)",marginBottom:"10px",letterSpacing:"0.05em" }}>{s.label}</p>
            <p style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"22px",color:s.color,marginBottom:"4px" }}>{s.value}</p>
            <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--text-muted)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Pending claims from Umbra SDK */}
      <div style={{ marginBottom:"40px" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px" }}>
          <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em" }}>
            On-Chain UTXOs
          </p>
          {utxos.length > 0 && (
            <span style={{ fontFamily:"var(--font-mono)",fontSize:"10px",padding:"3px 8px",borderRadius:"4px",background:"var(--cyan-dim)",color:"var(--cyan)",border:"1px solid var(--border-accent)" }}>
              {utxos.filter(u => u.status === "unclaimed").length} pending
            </span>
          )}
        </div>

        {fetchError && (
          <div style={{ padding:"12px 16px",borderRadius:"8px",background:"var(--red-dim)",border:"1px solid rgba(255,77,106,0.3)",marginBottom:"12px" }}>
            <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--red)" }}>{fetchError}</p>
          </div>
        )}

        {isFetching ? (
          <div style={{ display:"flex",alignItems:"center",gap:"12px",padding:"24px",borderRadius:"10px",background:"var(--bg-card)",border:"1px solid var(--border)" }}>
            <Loader2 size={16} color="var(--cyan)" style={{ animation:"spin 1s linear infinite" }} />
            <p style={{ fontFamily:"var(--font-display)",fontSize:"13px",color:"var(--text-muted)" }}>Scanning blockchain for your private UTXOs...</p>
          </div>
        ) : utxos.length === 0 ? (
          <div style={{ padding:"24px",borderRadius:"10px",background:"var(--bg-card)",border:"1px solid var(--border)",textAlign:"center" }}>
            <p style={{ fontFamily:"var(--font-display)",fontSize:"13px",color:"var(--text-muted)" }}>No on-chain UTXOs found for this wallet</p>
            <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)",marginTop:"4px" }}>Ask your employer to send payroll via VeilPay</p>
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
            {utxos.map(utxo => (
              <div key={utxo.id} style={{
                padding:"20px 24px",borderRadius:"10px",
                background:"var(--bg-card)",
                border:`1px solid ${utxo.status === "claimed" ? "rgba(0,229,160,0.3)" : utxo.status === "failed" ? "rgba(255,77,106,0.3)" : "var(--border)"}`,
                display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px"
              }}>
                <div style={{ display:"flex",alignItems:"center",gap:"16px" }}>
                  <div style={{
                    width:"40px",height:"40px",borderRadius:"50%",flexShrink:0,
                    background: utxo.status === "claimed" ? "var(--green-dim)" : "var(--cyan-dim)",
                    border:`1px solid ${utxo.status === "claimed" ? "rgba(0,229,160,0.3)" : "var(--border-accent)"}`,
                    display:"flex",alignItems:"center",justifyContent:"center"
                  }}>
                    {utxo.status === "claimed" ? <Unlock size={16} color="var(--green)" /> : <Lock size={16} color="var(--cyan)" />}
                  </div>
                  <div>
                    <p style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"18px",color:"var(--cyan)",marginBottom:"2px" }}>
                      {utxo.amount} {typeof utxo.token === "string" ? utxo.token.slice(-4) : "USDC"}
                    </p>
                    <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)" }}>
                      Private UTXO · {utxo.id.slice(0, 16)}...
                    </p>
                    {utxo.status === "claimed" && utxo.txSig && (
                      <div style={{ display:"flex",alignItems:"center",gap:"6px",marginTop:"4px" }}>
                        <CheckCircle size={11} color="var(--green)" />
                        <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--green)" }}>
                          Claimed → {utxo.txSig.slice(0, 20)}...
                        </p>
                      </div>
                    )}
                    {utxo.error && <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--red)",marginTop:"4px" }}>{utxo.error}</p>}
                  </div>
                </div>
                {utxo.status === "unclaimed" && (
                  <button onClick={() => claimUtxo(utxo)} disabled={!!claimingId} style={{
                    display:"flex",alignItems:"center",gap:"8px",padding:"10px 20px",
                    borderRadius:"8px",cursor:"pointer",flexShrink:0,
                    background:"var(--cyan)",border:"none",
                    color:"#050810",fontFamily:"var(--font-display)",fontWeight:700,fontSize:"13px",
                    boxShadow:"0 0 20px rgba(0,212,255,0.2)"
                  }}>
                    {claimingId === utxo.id
                      ? <><Loader2 size={13} style={{ animation:"spin 1s linear infinite" }} /> Claiming...</>
                      : <><Unlock size={13} /> Claim Payment</>
                    }
                  </button>
                )}
                {utxo.status === "claimed" && (
                  <span style={{ fontFamily:"var(--font-mono)",fontSize:"11px",padding:"4px 10px",borderRadius:"6px",background:"var(--green-dim)",color:"var(--green)",border:"1px solid rgba(0,229,160,0.3)" }}>
                    ✓ In encrypted balance
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Encrypted Payroll Memos */}
      <div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px" }}>
          <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em" }}>
            Encrypted Payroll Memos
          </p>
          {memos.length > 0 && (
            <span style={{ fontFamily:"var(--font-mono)",fontSize:"10px",padding:"3px 8px",borderRadius:"4px",background: memos.some(m => !m.claimed) ? "var(--cyan-dim)" : "var(--bg-card)",color: memos.some(m => !m.claimed) ? "var(--cyan)" : "var(--text-muted)",border:"1px solid var(--border)" }}>
              {memos.filter(m => !m.claimed).length} unread
            </span>
          )}
        </div>

        {memos.length === 0 ? (
          <div style={{ padding:"40px 24px",borderRadius:"12px",background:"var(--bg-card)",border:"1px solid var(--border)",textAlign:"center" }}>
            <div style={{ width:"48px",height:"48px",borderRadius:"50%",background:"var(--bg-card-hover)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
              <Inbox size={20} color="var(--text-muted)" />
            </div>
            <p style={{ fontFamily:"var(--font-display)",fontWeight:600,fontSize:"15px",color:"var(--text)",marginBottom:"6px" }}>No memos yet</p>
            <p style={{ fontFamily:"var(--font-display)",fontSize:"13px",color:"var(--text-muted)" }}>
              When your employer sends payroll with a memo, it will appear here — encrypted, only readable by you.
            </p>
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:"12px" }}>
            {memos.map(memo => {
              const revealed = revealedMemos.has(memo.id);
              return (
                <div key={memo.id} style={{
                  borderRadius:"12px",overflow:"hidden",
                  background:"var(--bg-card)",
                  border:`1px solid ${!memo.claimed ? "var(--border-accent)" : "var(--border)"}`,
                  transition:"border-color 0.2s"
                }}>
                  {/* Memo header */}
                  <div style={{ padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:"16px",flex:1,minWidth:0 }}>
                      <div style={{
                        width:"42px",height:"42px",borderRadius:"50%",flexShrink:0,
                        background: !memo.claimed ? "var(--cyan-dim)" : "var(--green-dim)",
                        border:`1px solid ${!memo.claimed ? "var(--border-accent)" : "rgba(0,229,160,0.3)"}`,
                        display:"flex",alignItems:"center",justifyContent:"center"
                      }}>
                        {memo.claimed ? <CheckCircle size={18} color="var(--green)" /> : <Lock size={18} color="var(--cyan)" />}
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px",flexWrap:"wrap" }}>
                          <p style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"18px",color:"var(--cyan)" }}>
                            {memo.amount} {memo.token}
                          </p>
                          {!memo.claimed && (
                            <span style={{ fontFamily:"var(--font-mono)",fontSize:"10px",padding:"2px 8px",borderRadius:"4px",background:"var(--cyan-dim)",color:"var(--cyan)",border:"1px solid var(--border-accent)" }}>
                              NEW
                            </span>
                          )}
                          {memo.claimed && (
                            <span style={{ fontFamily:"var(--font-mono)",fontSize:"10px",padding:"2px 8px",borderRadius:"4px",background:"var(--green-dim)",color:"var(--green)",border:"1px solid rgba(0,229,160,0.3)" }}>
                              CLAIMED
                            </span>
                          )}
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap" }}>
                          <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)" }}>
                            <Clock size={10} style={{ display:"inline",marginRight:"4px" }} />
                            {new Date(memo.timestamp).toLocaleString()}
                          </p>
                          <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)" }}>
                            From: {memo.senderAddress.slice(0, 8)}...{memo.senderAddress.slice(-4)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex",gap:"8px",flexShrink:0 }}>
                      <button onClick={() => toggleReveal(memo.id)} style={{
                        display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",borderRadius:"6px",cursor:"pointer",
                        background: revealed ? "var(--cyan-dim)" : "var(--bg-card-hover)",
                        border:`1px solid ${revealed ? "var(--border-accent)" : "var(--border)"}`,
                        color: revealed ? "var(--cyan)" : "var(--text-muted)",
                        fontFamily:"var(--font-display)",fontSize:"12px",transition:"all 0.2s"
                      }}>
                        {revealed ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Reveal Memo</>}
                      </button>
                      {!memo.claimed && (
                        <button onClick={() => claimMemo(memo)} style={{
                          display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",borderRadius:"6px",cursor:"pointer",
                          background:"var(--cyan)",border:"none",
                          color:"#050810",fontFamily:"var(--font-display)",fontWeight:700,fontSize:"12px"
                        }}>
                          <Unlock size={12} /> Mark Claimed
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Encrypted memo content */}
                  {!revealed && (
                    <div style={{ margin:"0 24px 18px",padding:"14px",borderRadius:"8px",background:"rgba(0,0,0,0.2)",border:"1px dashed rgba(255,255,255,0.08)" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
                        <Lock size={12} color="var(--text-muted)" />
                        <p style={{ fontFamily:"var(--font-mono)",fontSize:"12px",color:"var(--text-muted)",letterSpacing:"0.1em" }}>
                          ████████ ███ ███████ ███████ ██ ██████
                        </p>
                      </div>
                      <p style={{ fontFamily:"var(--font-display)",fontSize:"11px",color:"var(--text-muted)",marginTop:"6px" }}>
                        Encrypted with your X25519 key. Click "Reveal Memo" to decrypt.
                      </p>
                    </div>
                  )}

                  {revealed && (
                    <div style={{
                      margin:"0 24px 18px",padding:"16px",borderRadius:"8px",
                      background:"rgba(0,212,255,0.04)",border:"1px solid var(--border-accent)"
                    }}>
                      <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px" }}>
                        <Unlock size={12} color="var(--cyan)" />
                        <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--cyan)",letterSpacing:"0.08em",textTransform:"uppercase" }}>
                          Decrypted Memo
                        </p>
                      </div>
                      <p style={{ fontFamily:"var(--font-display)",fontSize:"14px",color:"var(--text)",fontWeight:500 }}>
                        {memo.memo}
                      </p>
                      {memo.claimTxSig && (
                        <div style={{ display:"flex",alignItems:"center",gap:"6px",marginTop:"10px" }}>
                          <CheckCircle size={11} color="var(--green)" />
                          <p style={{ fontFamily:"var(--font-mono)",fontSize:"10px",color:"var(--green)" }}>
                            Claimed: {memo.claimTxSig.slice(0, 24)}...
                          </p>
                          {!memo.claimTxSig.startsWith("local") && (
                            <a href={`https://solscan.io/tx/${memo.claimTxSig}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={10} color="var(--green)" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}