"use client";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Shield, Eye, FileText, Zap, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden" }}>

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        pointerEvents: "none"
      }} />

      {/* Glow orbs */}
      <div style={{
        position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: "800px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0, animation: "glow-pulse 4s ease infinite"
      }} />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        background: "rgba(5,8,16,0.8)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "var(--cyan-dim)", border: "1px solid var(--border-accent)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Shield size={16} color="var(--cyan)" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.02em", color: "var(--text)" }}>
            veil<span style={{ color: "var(--cyan)" }}>pay</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>
            powered by Umbra
          </span>
          <ClientOnly>
            <WalletMultiButton />
          </ClientOnly>
        </div>
      </nav>

      {/* HERO */}
      <main style={{ position: "relative", zIndex: 1, paddingTop: "160px", maxWidth: "1100px", margin: "0 auto", padding: "160px 40px 80px" }}>

        {/* Badge */}
        <div className="fade-up-1" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
          <div style={{
            padding: "6px 14px", borderRadius: "100px",
            border: "1px solid var(--border-accent)",
            background: "var(--cyan-dim)",
            display: "flex", alignItems: "center", gap: "8px"
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Private Payroll on Solana
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="fade-up-2" style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "clamp(48px, 7vw, 88px)", lineHeight: 1.0,
          letterSpacing: "-0.04em", color: "var(--text)", marginBottom: "28px"
        }}>
          Pay your team.<br />
          <span style={{
            background: "linear-gradient(135deg, var(--cyan) 0%, #0088ff 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>Leave no trace.</span>
        </h1>

        {/* Subheading */}
        <p className="fade-up-3" style={{
          fontSize: "18px", color: "var(--text-mid)", lineHeight: 1.7,
          maxWidth: "560px", marginBottom: "48px",
          fontFamily: "var(--font-display)", fontWeight: 400
        }}>
          Send payroll, pay contractors, and manage team compensation fully onchain — with confidential amounts and private addresses. Built on Umbra's privacy layer for Solana.
        </p>

        {/* CTA Buttons */}
        <div className="fade-up-4" style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "80px" }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "14px 28px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: "var(--cyan)", color: "#050810",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px",
              transition: "all 0.2s", boxShadow: "0 0 30px rgba(0,212,255,0.3)"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 50px rgba(0,212,255,0.5)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(0,212,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              Launch App <ArrowRight size={16} />
            </button>
          </Link>
          <a href="https://sdk.umbraprivacy.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <button style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "14px 28px", borderRadius: "10px", cursor: "pointer",
              background: "transparent", color: "var(--text-mid)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-accent)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--cyan)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-mid)"; }}
            >
              View Docs
            </button>
          </a>
        </div>

        {/* Trust bar */}
        <div className="fade-up-5" style={{
          display: "flex", gap: "24px", alignItems: "center",
          paddingTop: "32px", borderTop: "1px solid var(--border)"
        }}>
          {["Confidential Transfers", "Encrypted Balances", "Compliance-Ready", "Solana Devnet"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle size={13} color="var(--green)" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.03em" }}>{item}</span>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <section style={{ marginTop: "120px" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
            What you can build
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "56px", lineHeight: 1.1 }}>
            Financial privacy,<br />without the complexity.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            {[
              { icon: <Lock size={20} color="var(--cyan)" />, title: "Private Payroll", desc: "Salary payments where amounts and recipient addresses are fully confidential. No one can see what you pay each employee." },
              { icon: <Eye size={20} color="var(--cyan)" />, title: "Compliance Dashboard", desc: "Grant viewing keys to your accountant or auditor. They see exactly what they need — nothing more." },
              { icon: <Zap size={20} color="var(--cyan)" />, title: "Instant Private Transfers", desc: "Send USDC or any SPL token through Umbra's mixer. No on-chain link between sender and recipient." },
              { icon: <FileText size={20} color="var(--cyan)" />, title: "Payroll History", desc: "Your complete payment history, decrypted locally. Export to CSV for accounting without exposing data onchain." },
              { icon: <Shield size={20} color="var(--cyan)" />, title: "Encrypted Balances", desc: "Your treasury balance is shielded inside Umbra's encrypted account. Only you can see the numbers." },
              { icon: <CheckCircle size={20} color="var(--cyan)" />, title: "Batch Payments", desc: "Pay your entire team in a single payroll run. Each recipient gets a private, unlinkable transfer." },
            ].map((f, i) => (
              <div key={i} style={{
                padding: "28px", borderRadius: "12px",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                transition: "all 0.2s", cursor: "default"
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-accent)"; (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card-hover)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)"; }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "var(--cyan-dim)", border: "1px solid var(--border-accent)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px"
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", color: "var(--text)", marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{ marginTop: "100px", paddingTop: "32px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
            veilpay · built on <span style={{ color: "var(--cyan)" }}>Umbra Privacy</span> · Solana
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
            devnet · open source
          </span>
        </footer>
      </main>
    </div>
  );
}