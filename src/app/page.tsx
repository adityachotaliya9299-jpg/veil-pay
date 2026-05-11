"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ClientOnly } from "@/components/ClientOnly";
import {
  Shield, Eye, FileText, Zap, Lock, ArrowRight,
  CheckCircle, Users, Inbox, TrendingUp
} from "lucide-react";

const STATS = [
  { value: "0%", label: "On-chain exposure" },
  { value: "ZK", label: "Proof per payment" },
  { value: "100%", label: "Audit-ready" },
  { value: "∞", label: "Privacy guaranteed" },
];

const FEATURES = [
  {
    icon: <Zap size={20} />,
    tag: "CORE",
    title: "Private Payroll",
    desc: "Batch salary payments via Umbra's ZK mixer. No on-chain link between you and your team.",
    color: "var(--cyan)"
  },
  {
    icon: <Inbox size={20} />,
    tag: "FLAGSHIP",
    title: "Stealth Inbox",
    desc: "Employees receive payments privately. Encrypted memos only the recipient can read.",
    color: "#a78bfa",
    featured: true
  },
  {
    icon: <Shield size={20} />,
    tag: "PRIVACY",
    title: "Shield Assets",
    desc: "Deposit tokens into Umbra's encrypted balance. Your treasury becomes invisible.",
    color: "var(--green)"
  },
  {
    icon: <Eye size={20} />,
    tag: "COMPLIANCE",
    title: "Viewing Keys",
    desc: "Generate scoped keys for auditors. Monthly, yearly — share nothing extra.",
    color: "var(--cyan)"
  },
  {
    icon: <Users size={20} />,
    tag: "TEAM",
    title: "Address Book",
    desc: "Persistent employee management. Import via CSV. Pay with one click.",
    color: "var(--green)"
  },
  {
    icon: <FileText size={20} />,
    tag: "AUDIT",
    title: "Auditor Package",
    desc: "Export compliance bundles with viewing keys and integration instructions.",
    color: "#a78bfa"
  },
];

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>

      {/* Aurora blobs */}
      <div className="aurora">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>

      {/* Dot grid */}
      <div className="dot-grid" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(2,4,10,0.7)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px",
            background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Shield size={15} color="var(--cyan)" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "17px", letterSpacing: "-0.03em" }}>
            veil<span style={{ color: "var(--cyan)" }}>pay</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            POWERED BY UMBRA
          </span>
          <ClientOnly>
            <WalletMultiButton />
          </ClientOnly>
        </div>
      </nav>

      <main style={{ position: "relative", zIndex: 1 }}>

        {/* HERO */}
        <section
          ref={heroRef}
          style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 40px 80px", position: "relative" }}
        >
          {/* Mouse-follow glow */}
          <div style={{
            position: "absolute",
            width: "600px", height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)`,
            left: `${mousePos.x}%`, top: `${mousePos.y}%`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            transition: "left 0.8s cubic-bezier(0.4,0,0.2,1), top 0.8s cubic-bezier(0.4,0,0.2,1)",
          }} />

          <div style={{ maxWidth: "900px", textAlign: "center" }}>
            {/* Badge */}
            <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
              <div style={{
                padding: "6px 16px", borderRadius: "100px",
                background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)",
                backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center", gap: "8px"
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--cyan)", boxShadow: "0 0 10px var(--cyan)", animation: "glow-pulse 2s ease infinite" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Private Financial Infrastructure · Solana
                </span>
              </div>
            </div>

            {/* Main headline */}
            <h1 className="fade-up-1" style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "clamp(52px, 8vw, 96px)", lineHeight: 0.95,
              letterSpacing: "-0.05em", marginBottom: "32px"
            }}>
              <span style={{ color: "var(--text)" }}>Pay your team.</span><br />
              <span className="gradient-text">Leave no trace.</span>
            </h1>

            {/* Sub */}
            <p className="fade-up-2" style={{
              fontFamily: "var(--font-display)", fontSize: "clamp(16px, 2vw, 20px)",
              color: "var(--text-mid)", lineHeight: 1.6, maxWidth: "600px",
              margin: "0 auto 48px", fontWeight: 400
            }}>
              The complete privacy layer for Solana teams. Private payroll, stealth inbox, encrypted balances, and compliance tools — powered by Umbra's ZK infrastructure.
            </p>

            {/* CTAs */}
            <div className="fade-up-3" style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "64px" }}>
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <button className="btn-glow" style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "15px 32px", borderRadius: "12px", border: "none", cursor: "pointer",
                  background: "var(--cyan)", color: "#02040a",
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px",
                  letterSpacing: "-0.01em"
                }}>
                  Launch App <ArrowRight size={16} />
                </button>
              </Link>
              <a href="https://sdk.umbraprivacy.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <button style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "15px 32px", borderRadius: "12px", cursor: "pointer",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-mid)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px",
                  backdropFilter: "blur(10px)", transition: "all 0.25s",
                  letterSpacing: "-0.01em"
                }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "rgba(0,212,255,0.3)"; b.style.color = "var(--cyan)"; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "rgba(255,255,255,0.08)"; b.style.color = "var(--text-mid)"; }}
                >
                  Umbra SDK Docs
                </button>
              </a>
            </div>

            {/* Stats bar */}
            <div className="fade-up-4 glass" style={{
              display: "inline-grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0", padding: "0",
              margin: "0 auto", overflow: "hidden"
            }}>
              {STATS.map((s, i) => (
                <div key={s.label} style={{
                  padding: "20px 32px", textAlign: "center",
                  borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
                }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "24px", color: "var(--cyan)", marginBottom: "4px", letterSpacing: "-0.03em" }}>
                    {s.value}
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES — Bento Grid */}
        <section style={{ padding: "0 40px 120px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
              Everything you need
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(36px, 5vw, 56px)", letterSpacing: "-0.04em", color: "var(--text)", lineHeight: 1.05 }}>
              Financial privacy,<br />
              <span className="gradient-text-purple">without the complexity.</span>
            </h2>
          </div>

          {/* Bento grid layout */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "auto auto", gap: "16px" }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="card-hover glass"
                style={{
                  padding: "28px",
                  gridColumn: i === 1 ? "span 1" : "span 1",
                  background: f.featured ? "rgba(124,58,237,0.05)" : "rgba(255,255,255,0.02)",
                  border: f.featured ? "1px solid rgba(124,58,237,0.2)" : "1px solid rgba(255,255,255,0.06)",
                  position: "relative", overflow: "hidden"
                }}
              >
                {f.featured && (
                  <div style={{
                    position: "absolute", top: "16px", right: "16px",
                    padding: "4px 10px", borderRadius: "100px",
                    background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
                    fontFamily: "var(--font-mono)", fontSize: "9px", color: "#a78bfa",
                    letterSpacing: "0.1em", textTransform: "uppercase"
                  }}>
                    FLAGSHIP
                  </div>
                )}
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: `${f.color}15`, border: `1px solid ${f.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "16px", color: f.color
                }}>
                  {f.icon}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: f.color, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>
                    {f.tag}
                  </span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px", color: "var(--text)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                  {f.title}
                </h3>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PROOF OF PRIVACY — visual flow */}
        <section style={{ padding: "0 40px 120px", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: "-0.04em", color: "var(--text)", lineHeight: 1.1 }}>
              How the privacy works
            </h2>
          </div>

          <div className="glass" style={{ padding: "40px", borderRadius: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center", gap: "16px" }}>
              {[
                { label: "Employer Wallet", sub: "Sends payroll", icon: "💼", color: "var(--text-muted)", visible: true },
                null,
                { label: "Umbra Mixer", sub: "ZK proof generated", icon: "🔒", color: "var(--cyan)", visible: false },
                null,
                { label: "Employee Wallet", sub: "Claims privately", icon: "👤", color: "var(--green)", visible: true },
              ].map((item, i) => {
                if (!item) {
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "100%", height: "2px", background: "linear-gradient(90deg, rgba(0,212,255,0.1), rgba(0,212,255,0.4), rgba(0,212,255,0.1))" }} />
                    </div>
                  );
                }
                return (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <div style={{
                      width: "64px", height: "64px", borderRadius: "16px",
                      background: item.visible ? "rgba(255,255,255,0.04)" : "rgba(0,212,255,0.08)",
                      border: `1px solid ${item.visible ? "rgba(255,255,255,0.08)" : "rgba(0,212,255,0.2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 12px", fontSize: "24px"
                    }}>
                      {item.icon}
                    </div>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "14px", color: item.color, marginBottom: "4px" }}>{item.label}</p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)" }}>{item.sub}</p>
                    {item.visible && (
                      <div style={{ marginTop: "8px", padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", display: "inline-block" }}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)" }}>on-chain visible</p>
                      </div>
                    )}
                    {!item.visible && (
                      <div style={{ marginTop: "8px", padding: "4px 10px", borderRadius: "6px", background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)", display: "inline-block" }}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--cyan)" }}>link broken ✓</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
              {["Sender hidden", "Amount hidden", "Recipient hidden", "Memo encrypted", "Viewing key auditable"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={13} color="var(--green)" />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROADMAP */}
        <section style={{ padding: "0 40px 120px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "48px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>Roadmap</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: "-0.04em", color: "var(--text)", lineHeight: 1.1 }}>
              Payroll is just module one.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {[
              { status: "live", label: "Private Payroll" },
              { status: "live", label: "Stealth Inbox" },
              { status: "live", label: "Shield Assets" },
              { status: "live", label: "Compliance Tools" },
              { status: "soon", label: "Private Invoicing" },
              { status: "soon", label: "Contractor Payments" },
              { status: "soon", label: "DAO Treasury" },
              { status: "future", label: "Recurring Payroll" },
            ].map(item => (
              <div key={item.label} className="glass" style={{
                padding: "16px 20px",
                background: item.status === "live" ? "rgba(0,229,160,0.04)" : "rgba(255,255,255,0.02)",
                border: item.status === "live" ? "1px solid rgba(0,229,160,0.15)" : "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: item.status === "live" ? "var(--green)" : item.status === "soon" ? "var(--cyan)" : "var(--text-muted)",
                    boxShadow: item.status === "live" ? "0 0 8px var(--green)" : "none"
                  }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: item.status === "live" ? "var(--green)" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {item.status === "live" ? "live" : item.status === "soon" ? "soon" : "planned"}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "13px", color: "var(--text)" }}>{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <section style={{ padding: "0 40px 120px", maxWidth: "900px", margin: "0 auto" }}>
          <div className="glass" style={{
            padding: "60px 48px", borderRadius: "28px", textAlign: "center",
            background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.1)",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)",
              width: "600px", height: "400px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
              pointerEvents: "none"
            }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: "-0.04em", color: "var(--text)", marginBottom: "16px", lineHeight: 1.1 }}>
              Ready to pay privately?
            </h2>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "var(--text-muted)", marginBottom: "36px", maxWidth: "500px", margin: "0 auto 36px" }}>
              Connect your wallet and run your first private payroll in under 2 minutes.
            </p>
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <button className="btn-glow" style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                padding: "16px 40px", borderRadius: "14px", border: "none", cursor: "pointer",
                background: "var(--cyan)", color: "#02040a",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px",
                letterSpacing: "-0.01em"
              }}>
                Launch VeilPay <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "32px 40px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Shield size={14} color="var(--cyan)" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
              veilpay · built on <span style={{ color: "var(--cyan)" }}>Umbra Privacy</span>
            </span>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
            Solana · Open Source · MIT
          </span>
        </footer>
      </main>
    </div>
  );
}