"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { ClientOnly } from "@/components/ClientOnly";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUmbraClient } from "@/hooks/useUmbraClient";
import { useUmbraAccount } from "@/hooks/useUmbraAccount";
import { Shield, Lock, CheckCircle, AlertCircle, Loader2, Zap, Eye, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

function StatusDot({ status }: { status: "ok" | "warn" | "error" | "loading" }) {
  const colors = { ok: "var(--green)", warn: "var(--cyan)", error: "var(--red)", loading: "var(--text-muted)" };
  return (
    <div style={{
      width: "8px", height: "8px", borderRadius: "50%",
      background: colors[status],
      boxShadow: status === "ok" ? `0 0 6px var(--green)` : status === "warn" ? `0 0 6px var(--cyan)` : "none",
      animation: status === "loading" ? "glow-pulse 1.5s ease infinite" : "none"
    }} />
  );
}

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { client, status: clientStatus, error: clientError, retry } = useUmbraClient();
  const {
    regStatus, regError, isConfidential, isAnonymous, register, checkRegistration
  } = useUmbraAccount(client);

  // Not connected
  if (!connected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "24px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "16px",
          background: "var(--cyan-dim)", border: "1px solid var(--border-accent)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Lock size={28} color="var(--cyan)" />
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "24px", color: "var(--text)", marginBottom: "8px" }}>
            Connect your wallet
          </h2>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "var(--text-muted)" }}>
            Use Phantom or Solflare on Solana devnet
          </p>
        </div>
        <ClientOnly><WalletMultiButton /></ClientOnly>
      </div>
    );
  }

  const addr = publicKey?.toBase58() ?? "";
  const shortAddr = `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Derive display state
  const isClientReady = clientStatus === "ready" && !!client;
  const isRegistered = regStatus === "registered";
  const isLoading = clientStatus === "initializing" || regStatus === "checking" || regStatus === "registering";

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "40px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Overview
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "32px", letterSpacing: "-0.03em", color: "var(--text)" }}>
            Dashboard
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
            {shortAddr}
          </p>
        </div>
        <button onClick={checkRegistration} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
          background: "var(--bg-card)", border: "1px solid var(--border)",
          color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: "13px",
          transition: "all 0.2s"
        }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Umbra Setup Banner */}
      {!isRegistered && (
        <div style={{
          padding: "24px 28px", borderRadius: "12px", marginBottom: "32px",
          background: isClientReady ? "rgba(0,212,255,0.05)" : "rgba(255,77,106,0.05)",
          border: `1px solid ${isClientReady ? "var(--border-accent)" : "rgba(255,77,106,0.3)"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0,
              background: isClientReady ? "var(--cyan-dim)" : "var(--red-dim)",
              border: `1px solid ${isClientReady ? "var(--border-accent)" : "rgba(255,77,106,0.3)"}`,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {isLoading
                ? <Loader2 size={20} color="var(--cyan)" style={{ animation: "spin 1s linear infinite" }} />
                : isClientReady
                  ? <Shield size={20} color="var(--cyan)" />
                  : <AlertCircle size={20} color="var(--red)" />
              }
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px", color: "var(--text)", marginBottom: "4px" }}>
                {clientStatus === "initializing" ? "Connecting to Umbra..." :
                 regStatus === "checking" ? "Checking Umbra account..." :
                 regStatus === "registering" ? "Registering on Umbra..." :
                 isClientReady ? "Register with Umbra to start" :
                 clientError ?? "Umbra client error"}
              </p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "var(--text-muted)" }}>
                {clientStatus === "initializing" ? "Building signer from your wallet..." :
                 regStatus === "checking" ? "Reading on-chain account state..." :
                 regStatus === "registering" ? "Sign the transactions in your wallet (up to 3)" :
                 isClientReady ? "One-time setup creates your private Umbra identity onchain" :
                 "Make sure Phantom/Solflare is connected on devnet"}
              </p>
              {(regError || clientError) && (
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--red)", marginTop: "6px" }}>
                  {regError || clientError}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            {clientStatus === "error" && (
              <button onClick={retry} style={{
                padding: "10px 20px", borderRadius: "8px", cursor: "pointer",
                background: "var(--red-dim)", border: "1px solid rgba(255,77,106,0.3)",
                color: "var(--red)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "13px"
              }}>
                Retry
              </button>
            )}
            {isClientReady && regStatus === "unregistered" && (
              <button onClick={register} style={{
                padding: "10px 20px", borderRadius: "8px", cursor: "pointer",
                background: "var(--cyan)", border: "none",
                color: "#050810", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "13px",
                boxShadow: "0 0 20px rgba(0,212,255,0.3)"
              }}>
                Register with Umbra
              </button>
            )}
          </div>
        </div>
      )}

      {/* Status cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {[
          {
            label: "Umbra Client",
            value: clientStatus === "ready" ? "Connected" : clientStatus === "initializing" ? "Connecting..." : "Not Ready",
            sub: clientStatus === "ready" ? "devnet" : clientStatus === "error" ? "Check wallet" : "Waiting...",
            dot: clientStatus === "ready" ? "ok" : clientStatus === "initializing" ? "loading" : "error"
          },
          {
            label: "Umbra Account",
            value: regStatus === "registered" ? "Registered" : regStatus === "checking" ? "Checking..." : regStatus === "registering" ? "Registering..." : "Not Registered",
            sub: regStatus === "registered" ? "Identity active" : "Setup required",
            dot: regStatus === "registered" ? "ok" : regStatus === "checking" || regStatus === "registering" ? "loading" : "warn"
          },
          {
            label: "Encrypted Balances",
            value: isConfidential ? "Enabled" : "Disabled",
            sub: isConfidential ? "Balance is private" : "Register first",
            dot: isConfidential ? "ok" : "warn"
          },
          {
            label: "Mixer / Anonymous",
            value: isAnonymous ? "Enabled" : "Disabled",
            sub: isAnonymous ? "Private transfers ready" : "Register first",
            dot: isAnonymous ? "ok" : "warn"
          },
        ].map((s) => (
          <div key={s.label} style={{
            padding: "24px", borderRadius: "12px",
            background: "var(--bg-card)", border: "1px solid var(--border)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                {s.label}
              </p>
              <StatusDot status={s.dot as "ok" | "warn" | "error" | "loading"} />
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", color: "var(--text)", marginBottom: "4px" }}>
              {s.value}
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions — only show when registered */}
      {isRegistered && (
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
            Quick Actions
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
            {[
              { href: "/payroll", icon: <Zap size={16} color="var(--cyan)" />, label: "New Payroll Run", desc: "Send private payments to your team" },
              { href: "/compliance", icon: <Eye size={16} color="var(--cyan)" />, label: "Compliance View", desc: "Decrypt transactions with viewing key" },
            ].map((a) => (
              <Link key={a.href} href={a.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "20px 24px", borderRadius: "10px",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  transition: "all 0.2s", cursor: "pointer"
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-accent)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "8px",
                      background: "var(--cyan-dim)", border: "1px solid var(--border-accent)",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {a.icon}
                    </div>
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", color: "var(--text)", marginBottom: "2px" }}>{a.label}</p>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: "12px", color: "var(--text-muted)" }}>{a.desc}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Add spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}