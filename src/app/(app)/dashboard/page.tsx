"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { ClientOnly } from "@/components/ClientOnly";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUmbraClient } from "@/hooks/useUmbraClient";
import { Lock, Zap, Eye, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { status } = useUmbraClient();

  if (!connected) {
    return (
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:"24px" }}>
        <div style={{ width:"64px",height:"64px",borderRadius:"16px",background:"var(--cyan-dim)",border:"1px solid var(--border-accent)",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Lock size={28} color="var(--cyan)" />
        </div>
        <div style={{ textAlign:"center" }}>
          <h2 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"24px",color:"var(--text)",marginBottom:"8px" }}>Connect your wallet</h2>
          <p style={{ fontFamily:"var(--font-display)",fontSize:"14px",color:"var(--text-muted)" }}>Use Phantom or Solflare on Solana</p>
        </div>
        <ClientOnly><WalletMultiButton /></ClientOnly>
      </div>
    );
  }

  const addr = publicKey?.toBase58() ?? "";
  const short = `${addr.slice(0,6)}...${addr.slice(-4)}`;

  return (
    <div>
      <div style={{ marginBottom:"40px" }}>
        <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--cyan)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"8px" }}>Overview</p>
        <h1 style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"32px",letterSpacing:"-0.03em",color:"var(--text)" }}>Dashboard</h1>
        <p style={{ fontFamily:"var(--font-mono)",fontSize:"12px",color:"var(--text-muted)",marginTop:"6px" }}>{short}</p>
      </div>

      {/* Status */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"16px",marginBottom:"40px" }}>
        {[
          { label:"Umbra Client", value: status === "ready" ? "Connected" : status === "initializing" ? "Connecting..." : "Idle", dot: status === "ready" ? "var(--green)" : "var(--cyan)" },
          { label:"Network", value:"Mainnet", dot:"var(--cyan)" },
          { label:"Privacy Layer", value:"Umbra SDK", dot:"var(--green)" },
          { label:"Transfer Type", value:"UTXO Mixer", dot:"var(--green)" },
        ].map(s => (
          <div key={s.label} style={{ padding:"24px",borderRadius:"12px",background:"var(--bg-card)",border:"1px solid var(--border)" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px" }}>
              <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)" }}>{s.label}</p>
              <div style={{ width:"8px",height:"8px",borderRadius:"50%",background:s.dot,boxShadow:`0 0 6px ${s.dot}` }} />
            </div>
            <p style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"18px",color:"var(--text)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <p style={{ fontFamily:"var(--font-mono)",fontSize:"11px",color:"var(--text-muted)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"16px" }}>Quick Actions</p>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"12px" }}>
        {[
          { href:"/payroll", icon:<Zap size={16} color="var(--cyan)" />, label:"New Payroll Run", desc:"Send private payments to your team" },
          { href:"/compliance", icon:<Eye size={16} color="var(--cyan)" />, label:"Compliance View", desc:"Decrypt transactions with viewing key" },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration:"none" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderRadius:"10px",background:"var(--bg-card)",border:"1px solid var(--border)",transition:"all 0.2s",cursor:"pointer" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor="var(--border-accent)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor="var(--border)"}>
              <div style={{ display:"flex",alignItems:"center",gap:"14px" }}>
                <div style={{ width:"36px",height:"36px",borderRadius:"8px",background:"var(--cyan-dim)",border:"1px solid var(--border-accent)",display:"flex",alignItems:"center",justifyContent:"center" }}>{a.icon}</div>
                <div>
                  <p style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"14px",color:"var(--text)",marginBottom:"2px" }}>{a.label}</p>
                  <p style={{ fontFamily:"var(--font-display)",fontSize:"12px",color:"var(--text-muted)" }}>{a.desc}</p>
                </div>
              </div>
              <ArrowRight size={14} color="var(--text-muted)" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}